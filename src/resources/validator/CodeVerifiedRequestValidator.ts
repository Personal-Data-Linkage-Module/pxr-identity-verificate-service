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
 * 確認済本人性確認コード生成のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class CodeVerifiedRequestValidator implements ExpressMiddlewareInterface {
    async use (request: Request, response: Response, next: NextFunction) {
        // リクエストが空か確認
        if (!request.body || JSON.stringify(request.body) === JSON.stringify({})) {
            throw new AppError(Message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }

        const pxrId = request.body.pxrId;
        const userId = request.body.userId;
        const actor = request.body.actor;
        const region = request.body.region;
        const app = request.body.app;

        // 確認用関数の生成
        const objectChecker = (target: any): boolean => {
            // 引数がオブジェクト型であることを確認
            if (!target || typeof target !== 'object' || Array.isArray(target)) {
                return false;
            }
            // コード値のそれぞれが数値であることを確認
            if (isNaN(parseInt(target._value)) || isNaN(parseInt(target._ver))) {
                return false;
            }
            // 正常を返す
            return true;
        };

        // 必須値の確認
        if (!actor || !pxrId || !userId) {
            throw new AppError(Message.REQUEST_MISS_REQUIRED, ResponseCode.BAD_REQUEST);
        }
        // リクエストがコードオブジェクト形式か
        if (
            !objectChecker(actor)
        ) {
            throw new AppError(Message.REQUEST_INVALID_CODE_OBJECT, ResponseCode.BAD_REQUEST);
        }
        // リクエストがコードオブジェクト形式か
        if (
            region && !objectChecker(region)
        ) {
            throw new AppError(Message.REQUEST_INVALID_CODE_OBJECT, ResponseCode.BAD_REQUEST);
        }
        // リクエストがコードオブジェクト形式か
        if (
            app && !objectChecker(app)
        ) {
            throw new AppError(Message.REQUEST_INVALID_CODE_OBJECT, ResponseCode.BAD_REQUEST);
        }

        next();
    }
}
