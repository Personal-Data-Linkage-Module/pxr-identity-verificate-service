/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
/* eslint-enable */
import IdentifyVerifyEntity from '../../repositories/postgres/IdentifyVerifyEntity';
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
const Message = Config.ReadConfig('./config/message.json');

/**
 * 第三者による本人性確認のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class VerifyRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // リクエストが空か、確認する
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }
        // 必須値の確認
        if (request.body.status !== 0 && !request.body.status) {
            throw new AppError(Message.REQUEST_MISS_REQUIRED, ResponseCode.BAD_REQUEST);
        }
        // 値の型を確認する
        if (isNaN(parseInt(request.body.status))) {
            throw new AppError(Message.REQUEST_PARAMETER_IS_NOT_NUMBER, ResponseCode.BAD_REQUEST);
        }
        // ステータスパラメーターが、1, 2の範囲であるかを確認する
        const num = parseInt(request.body.status);
        if (
            num !== IdentifyVerifyEntity.SUCCESS &&
            num !== IdentifyVerifyEntity.FAILED
        ) {
            throw new AppError(Message.REQUEST_STATUS_PARAMETER_IS_INVALID, ResponseCode.BAD_REQUEST);
        }

        next();
    }
}
