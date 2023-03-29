/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
/* eslint-enable */
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * 利用者情報設定のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class UserRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // リクエストが空か、確認する
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }

        // パラメーターの取り出し
        const identifyCode = request.body.identifyCode;
        const userId = request.body.userId;

        // 必須値の確認
        if (!identifyCode || !userId) {
            throw new AppError(Message.REQUEST_MISS_REQUIRED, ResponseCode.BAD_REQUEST);
        }
        // 型の確認（文字列）
        if (typeof identifyCode !== 'string' || typeof userId !== 'string') {
            throw new AppError(Message.REQUEST_PARAMETER_IS_NOT_STRING, ResponseCode.BAD_REQUEST);
        }
        // userIdが半角文字以外の場合エラー
        if (!userId.match(/^[\x20-\x7e]*$/)) {
            throw new AppError(Message.USERID_ASCII_ONLY, ResponseCode.BAD_REQUEST);
        }

        next();
    }
}
