/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request } from 'express';
import { CoreOptions } from 'request';
/* eslint-enable */
import AppError from '../common/AppError';
import Config from '../common/Config';
import { doPostRequest } from '../common/DoRequest';
import { ResponseCode } from '../common/ResponseCode';
import OperatorDomain from '../domains/OperatorDomain';
import configYaml = require('config');
const config = Config.ReadConfig('./config/config.json');
const message = Config.ReadConfig('./config/message.json');

/**
 * オペレーターサービスとの連携クラス
 */
export default class OperatorService {
    /**
     * オペレーターのセッション情報を取得する
     * @param req リクエストオブジェクト
     */
    static async authMe (req: Request): Promise<OperatorDomain> {
        const { cookies } = req;
        const sessionId = cookies[OperatorDomain.TYPE_PERSONAL_KEY]
            ? cookies[OperatorDomain.TYPE_PERSONAL_KEY]
            : cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                ? cookies[OperatorDomain.TYPE_APPLICATION_KEY]
                : cookies[OperatorDomain.TYPE_MANAGER_KEY];
        // Cookieからセッションキーが取得できた場合、オペレーターサービスに問い合わせる
        if (typeof sessionId === 'string' && sessionId.length > 0) {
            const body = JSON.stringify({ sessionId: sessionId });
            const options: CoreOptions = {
                headers: {
                    accept: 'application/json',
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(body)
                },
                body: body
            };
            try {
                // 設定ファイル読込
                const url: string = configYaml.get('operator.session');
                const result = await doPostRequest(
                    url,
                    options
                );
                // ステータスコードにより制御
                const { statusCode } = result.response;
                if (statusCode === 204 || statusCode === 400) {
                    throw new AppError(message.NOT_AUTHORIZED, 401);
                } else if (statusCode !== 200) {
                    throw new AppError(message.FAILED_TAKE_SESSION, 500);
                }
                let data = result.body;
                while (typeof data === 'string') {
                    data = JSON.parse(data);
                }
                return new OperatorDomain(data);
            } catch (err) {
                if (err.name === AppError.NAME) {
                    throw err;
                }
                throw new AppError(message.FAILED_CONNECT_TO_OPERATOR, 500, err);
            }

        // ヘッダーにセッション情報があれば、それを流用する
        } else if (req.headers.session) {
            let data = decodeURIComponent(req.headers.session + '');
            while (typeof data === 'string') {
                data = JSON.parse(data);
            }
            return new OperatorDomain(data, req.headers.session + '');

        // セッション情報が存在しない場合、未ログインとしてエラーをスローする
        } else {
            throw new AppError(message.NOT_AUTHORIZED, 401);
        }
    }

    /**
     * 本人性確認コード登録
     * @param identifyCode 本人性確認コード
     * @param expirationAt 有効期限
     */
    static async postIdentifyCode (operator: OperatorDomain, identifyCode: string, expirationAt: string) {
        const url = config['operatorService']['postIdentifyCode'];
        const body = JSON.stringify({
            identifyCode: identifyCode,
            expirationAt: expirationAt
        });
        const options: CoreOptions = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body)
            },
            body: body
        };
        options.headers.session = operator.encoded;

        try {
            const result = await doPostRequest(url, options);
            const { statusCode } = result.response;
            if (statusCode !== ResponseCode.OK) {
                // 200ステータスコードではない場合は、エラーとする
                throw new AppError(message.FAILED_POST_IDENTIFY_CODE, ResponseCode.INTERNAL_SERVER_ERROR);
            }
        } catch (err) {
            // アプリケーション例外の場合は、そのままスローする
            if (err.name === AppError.NAME) {
                throw err;
            }
            // 未定義エラーの場合は、内包してアプリケーション例外を投げる
            throw new AppError(message.FAILED_CONNECT_TO_OPERATOR, ResponseCode.INTERNAL_SERVER_ERROR, err);
        }
    }
}
