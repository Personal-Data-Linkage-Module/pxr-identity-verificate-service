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
 * URL発行のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class UrlConfirmRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // リクエストが空か、確認する
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }

        // パラメーターの取り出し
        const path = request.body.path;

        // 必須値の確認
        if (!path) {
            throw new AppError(Message.REQUEST_MISS_REQUIRED, ResponseCode.BAD_REQUEST);
        }
        // 型の確認（文字列）
        if (typeof path !== 'string') {
            throw new AppError(Message.REQUEST_PARAMETER_IS_NOT_STRING, ResponseCode.BAD_REQUEST);
        }

        next();
    }
}
