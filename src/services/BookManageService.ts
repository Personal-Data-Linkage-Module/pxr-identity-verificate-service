/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import BookManageDto from './dto/BookManageDto';
import { CoreOptions } from 'request';
import OperatorDomain from 'domains/OperatorDomain';
/* eslint-enable */
import { doPostRequest } from '../common/DoRequest';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import Config from '../common/Config';
import * as config from 'config';
const message = Config.ReadConfig('./config/message.json');

/**
 * My-Condition-Book管理サービス
 */
export default class BookManageService {
    /**
     * 利用者ID連携申請
     * @param dto
     * @param operator
     */
    public async postCooperateRequest (dto: BookManageDto, operator: OperatorDomain, isCoop: boolean = false): Promise<any> {
        // URLを生成
        let url;
        if (!isCoop) {
            url = String(config.get('bookManage.cooperateRequest'));
        } else {
            url = String(config.get('bookManage.cooperateRequestRelease'));
        }

        const region = dto.getRegionCode()
            ? {
                _value: dto.getRegionCode(),
                _ver: dto.getRegionVersion()
            }
            : null;

        const app = dto.getAppCode()
            ? {
                _value: dto.getAppCode(),
                _ver: dto.getAppVersion()
            }
            : null;

        // bodyを生成
        let body;
        if (dto.getUserId()) {
            body = JSON.stringify({
                pxrId: dto.getPxrId(),
                actor: {
                    _value: dto.getActorCode(),
                    _ver: dto.getActorVesion()
                },
                region: region,
                app: app,
                wf: null,
                userId: dto.getUserId()
            });
        } else {
            body = JSON.stringify({
                pxrId: dto.getPxrId(),
                actor: {
                    _value: dto.getActorCode(),
                    _ver: dto.getActorVesion()
                },
                region: region,
                app: app,
                wf: null
            });
        }

        // 接続のためのオプションを生成
        const options: CoreOptions = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                session: operator.encoded
            },
            body: body
        };

        try {
            // Book管理サービスから利用者ID連携申請を呼び出す
            const result = await doPostRequest(url, options);

            // ステータスコードを判定
            const statusCode: string = result.response.statusCode.toString();
            if (result.response.statusCode === ResponseCode.BAD_REQUEST) {
                // 応答が400の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_REQUEST, ResponseCode.BAD_REQUEST);
            } else if (statusCode.match(/^5.+/)) {
                // 応答が500系の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_REQUEST, ResponseCode.SERVICE_UNAVAILABLE);
            } else if (result.response.statusCode !== ResponseCode.OK) {
                // 応答が200以外の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_REQUEST, ResponseCode.UNAUTHORIZED);
            }
            // 利用者ID連携申請情報を戻す
            return JSON.parse(result.body);
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(message.FAILED_CONNECT_TO_BOOK_MANAGE, ResponseCode.SERVICE_UNAVAILABLE, err);
        }
    }

    /**
     * 利用者ID設定
     * @param dto
     * @param operator
     */
    public async postCooperateUser (dto: BookManageDto, operator: OperatorDomain): Promise<any> {
        // URLを生成
        const url = String(config.get('bookManage.cooperateUser'));

        const region = dto.getRegionCode()
            ? {
                _value: dto.getRegionCode(),
                _ver: dto.getRegionVersion()
            }
            : null;

        const app = dto.getAppCode()
            ? {
                _value: dto.getAppCode(),
                _ver: dto.getAppVersion()
            }
            : null;

        // bodyを生成
        const body = JSON.stringify({
            pxrId: dto.getPxrId(),
            userId: dto.getUserId(),
            actor: {
                _value: dto.getActorCode(),
                _ver: dto.getActorVesion()
            },
            region: region,
            app: app,
            wf: null
        });

        // 接続のためのオプションを生成
        const options: CoreOptions = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                session: operator.encoded
            },
            body: body
        };

        try {
            // Book管理サービスから利用者ID設定を呼び出す
            const result = await doPostRequest(url, options);

            // ステータスコードを判定
            const statusCode: string = result.response.statusCode.toString();
            if (result.response.statusCode === ResponseCode.BAD_REQUEST) {
                // 応答が400の場合、エラーを返す
                let errMessage: string = message.FAILED_COOPERATE_USER;
                try {
                    if (result.body && JSON.parse(result.body).message) {
                        errMessage = JSON.parse(result.body).message;
                    }
                } catch (e) {
                    throw new AppError(message.FAILED_COOPERATE_USER, ResponseCode.BAD_REQUEST);
                }
                throw new AppError(errMessage, ResponseCode.BAD_REQUEST);
            } else if (statusCode.match(/^5.+/)) {
                // 応答が500系の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_USER, ResponseCode.SERVICE_UNAVAILABLE);
            } else if (result.response.statusCode !== ResponseCode.OK) {
                // 応答が200以外の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_USER, ResponseCode.UNAUTHORIZED);
            }
            // 利用者ID設定情報を戻す
            return JSON.parse(result.body);
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(message.FAILED_CONNECT_TO_BOOK_MANAGE, ResponseCode.SERVICE_UNAVAILABLE, err);
        }
    }

    /**
     * 利用者連携取得
     * @param dto
     * @param operator
     */
    public async postSearch (dto: BookManageDto, operator: OperatorDomain): Promise<any> {
        // URLを生成
        const url = String(config.get('bookManage.search'));

        // bodyを生成
        const body = JSON.stringify({
            pxrId: [
                dto.getPxrId()
            ],
            createdAt: null
        });

        // 接続のためのオプションを生成
        const options: CoreOptions = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(body),
                session: operator.encoded
            },
            body: body
        };

        try {
            // Book管理サービスから利用者ID設定を呼び出す
            const result = await doPostRequest(url, options);

            // ステータスコードを判定
            const statusCode: string = result.response.statusCode.toString();
            if (result.response.statusCode === ResponseCode.BAD_REQUEST) {
                // 応答が400の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_USER, ResponseCode.BAD_REQUEST);
            } else if (statusCode.match(/^5.+/)) {
                // 応答が500系の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_USER, ResponseCode.SERVICE_UNAVAILABLE);
            } else if (result.response.statusCode !== ResponseCode.OK) {
                // 応答が200以外の場合、エラーを返す
                throw new AppError(message.FAILED_COOPERATE_USER, ResponseCode.UNAUTHORIZED);
            }
            // 利用者ID設定情報を戻す
            return JSON.parse(result.body);
        } catch (err) {
            if (err.name === AppError.NAME) {
                throw err;
            }
            // サービスへの接続に失敗した場合
            throw new AppError(message.FAILED_CONNECT_TO_BOOK_MANAGE, ResponseCode.SERVICE_UNAVAILABLE, err);
        }
    }
}
