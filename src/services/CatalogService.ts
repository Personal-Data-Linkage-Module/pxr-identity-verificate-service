/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import Log from '../common/Log';
import * as configYaml from 'config';
import AppError from '../common/AppError';
import { sprintf } from 'sprintf-js';
import { ResponseCode } from '../common/ResponseCode';
import { doGetRequest } from '../common/DoRequest';
import Config from '../common/Config';
/* eslint-disable */
import CatalogDto from './dto/CatalogDto';
import Operator from '../domains/OperatorDomain';
import request = require('request');
/* eslint-enable */
const config = Config.ReadConfig('./config/config.json');
const message = Config.ReadConfig('./config/message.json');

/**
 * カタログオブジェクト
 */
export default class Catalog {
    /** コード */
    code: number;

    /** バージョン */
    version: number;

    /** メインブロック */
    mainBlockCode?: number;

    /** 受け取ったデータ */
    data?: any;

    /**
     * 自身に設定されたコードとバージョンから、カタログサービスへ問い合わせる
     * @param callback コールバック
     */
    public async search (operator: Operator) {
        try {
            const options: request.CoreOptions = {
                headers: {
                    accept: 'application/json'
                }
            };
            options.headers.session = operator.encoded;

            const url = configYaml.get('catalog.base') + `/${this.code}`;
            const result = await doGetRequest(url, options);

            // レスポンス内容をログ出力
            Log.Debug(sprintf(message.CATALOG_RESPONSE_BODY, result.body));

            // ステータスコードにより、ハンドリング
            const { statusCode } = result.response;
            if (statusCode === ResponseCode.BAD_REQUEST || statusCode === ResponseCode.NO_CONTENT) {
                // ログ出力
                Log.Error(sprintf(message.CATALOG_RESPONSE_STATUS, statusCode));
                // カタログが存在していないとし、エラーとする
                throw new AppError(sprintf(message.CATALOG_IS_NOT_EXISTS, this.code), ResponseCode.BAD_REQUEST);
            } else if (statusCode !== ResponseCode.OK) {
                // ログ出力
                Log.Error(sprintf(message.CATALOG_RESPONSE_STATUS, statusCode));
                // 200ステータス以外の場合、処理に失敗したとする
                throw new AppError(message.FAILED_GET_CATALOG, ResponseCode.INTERNAL_SERVER_ERROR);
            }

            // 受け取ったデータをJSONにする
            this.data = result.body;
            while (typeof this.data === 'string') {
                this.data = JSON.parse(this.data);
            }

            // main-blockを保持しているか、確認する
            const mainBlock = this.data.template['main-block'];
            if (typeof mainBlock === 'object' && !isNaN(parseInt(mainBlock._value))) {
                // mainBlockのコード値とバージョンを取り出す
                this.mainBlockCode = parseInt(mainBlock._value);
            }
            // メンバーへ保持する値は、取り出して追加する
            this.code = parseInt(this.data.template._code._value);
            this.version = parseInt(this.data.template._code._ver);
        } catch (err) {
            // アプリケーション例外の場合は、そのままスローする
            if (err.name === AppError.NAME) {
                throw err;
            }
            // 未定義エラーの場合は、内包してアプリケーション例外を投げる
            throw new AppError(
                message.FAILED_GET_CATALOG,
                ResponseCode.INTERNAL_SERVER_ERROR, err);
        }
    }

    /**
     * カタログ取得
     * @param catalogDto
     */
    public async getCatalog (catalogDto: CatalogDto): Promise<any> {
        // ネームスペースでカタログを取得する
        const url = config['catalogService']['getCatalogName'];

        const options = {
            headers: {
                accept: 'application/json',
                session: encodeURIComponent(JSON.stringify(catalogDto.getOperator()))
            }
        };

        // カタログサービスからカタログを取得
        const result = await doGetRequest(url, options);

        // ステータスコードを判定
        const statusCode: string = result.response.statusCode.toString();
        if (result.response.statusCode === ResponseCode.BAD_REQUEST) {
            // 応答が400の場合、エラーを返す
            throw new AppError(message.FAILED_GET_CATALOG, ResponseCode.BAD_REQUEST);
        } else if (statusCode.match(/^5.+/)) {
            // 応答が500系の場合、エラーを返す
            throw new AppError(message.FAILED_GET_CATALOG, ResponseCode.SERVICE_UNAVAILABLE);
        } else if (result.response.statusCode !== ResponseCode.OK) {
            // 応答が200 OK以外の場合、エラーを返す
            throw new AppError(message.FAILED_GET_CATALOG, ResponseCode.UNAUTHORIZED);
        }
        // カタログ情報を戻す
        return JSON.parse(result.body);
    }
}
