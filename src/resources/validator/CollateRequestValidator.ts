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
 * 本人性確認コード照合のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class CollateRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // リクエストが空か、確認する
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }
        // 必須値の確認
        if (!request.body.identifyCode) {
            throw new AppError(Message.REQUEST_MISS_REQUIRED, ResponseCode.BAD_REQUEST);
        }
        // 型の確認
        if (typeof request.body.identifyCode !== 'string') {
            throw new AppError(Message.REQUEST_PARAMETER_IS_NOT_STRING, ResponseCode.BAD_REQUEST);
        }

        next();
    }
}
