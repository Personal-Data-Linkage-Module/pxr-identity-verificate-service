/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Log from '../common/Log';
import * as config from 'config';
import AppError from '../common/AppError';
import { sprintf } from 'sprintf-js';
import { doPostRequest } from '../common/DoRequest';
import { ResponseCode } from '../common/ResponseCode';
import Operator from '../domains/OperatorDomain';
import Config from '../common/Config';
import request = require('request');
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

/**
 * 通知オブジェクト
 * + addメソッドをコールすることで、通知サービスへ自身を登録させる
 */
export class Notification {
    type = 0;
    destinationOperatorType = 0;
    destinationIsSendAll = true;
    destinationOperatorId: number[] = null;
    destinationUserId: string[] = null;
    categoryCode: number = null;
    categoryVersion: number = null;
    title: string;
    content: string;
    attribute: {};
    fromApplicationCode: number = null;
    fromWorkflowCode: number = null;
    destinationBlockCode: number = null;

    /**
     * 自身をオブジェクト化する
     */
    public toObject (): {} {
        return {
            type: this.type,
            title: this.title,
            content: this.content,
            attribute: this.attribute,
            category: {
                _value: this.categoryCode,
                _ver: this.categoryVersion
            },
            from: {
                applicationCode: this.fromApplicationCode,
                workflowCode: null
            },
            destination: {
                blockCode: this.destinationBlockCode,
                operatorType: this.destinationOperatorType,
                isSendAll: this.destinationIsSendAll,
                operatorId: this.destinationOperatorId,
                userId: this.destinationUserId
            }
        };
    }

    /**
     * 自身を通知サービスへ登録する
     * @param sessionValue セッション情報
     * @param callback コールバック
     */
    public async addRequest (operator: Operator) {
        try {
            const url = config.get('notification.base') + '';
            const data = JSON.stringify(this.toObject());
            const options: request.CoreOptions = {
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                },
                body: data
            };
            options.headers.session = operator.encoded;
            const result = await doPostRequest(url, options);
            // ステータスコードにより、ハンドリング
            const { statusCode } = result.response;
            if (statusCode !== ResponseCode.OK) {
                // ログ出力
                Log.Error(
                    sprintf(Message.NOTICE_RESPONSE_STATUS, statusCode));
                // 200ステータスコードではない場合は、エラーとする
                throw new AppError(
                    Message.NOTIFICATION_CREATION_ERROR,
                    ResponseCode.INTERNAL_SERVER_ERROR);
            }
        } catch (err) {
            // アプリケーション例外の場合は、そのままスローする
            if (err.name === AppError.NAME) {
                throw err;
            }
            // 未定義エラーの場合は、内包してアプリケーション例外を投げる
            throw new AppError(
                Message.FAILED_ADD_NOTIFICATION_REQUEST,
                ResponseCode.INTERNAL_SERVER_ERROR, err);
        }
    }
}
