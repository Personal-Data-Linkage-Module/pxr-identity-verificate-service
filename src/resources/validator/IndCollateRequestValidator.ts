/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response, NextFunction } from 'express';
import { Middleware, ExpressMiddlewareInterface } from 'routing-controllers';
import { transformAndValidate } from 'class-transformer-validator';
/* eslint-enable */
import AppError from '../../common/AppError';
import { ResponseCode } from '../../common/ResponseCode';
import Config from '../../common/Config';
import PostIndCollateReqDto from '../dto/PostIndCollateReqDto';
const message = Config.ReadConfig('./config/message.json');

/**
 * 本人性確認コード照合のバリデーションチェック
 */
@Middleware({ type: 'before' })
export default class IndCollateRequestValidator implements ExpressMiddlewareInterface {
    async use (req: Request, res: Response, next: NextFunction) {
        // リクエストが空か、確認する
        if (!req.body || JSON.stringify(req.body) === JSON.stringify({})) {
            throw new AppError(message.REQUEST_IS_EMPTY, ResponseCode.BAD_REQUEST);
        }

        const dto = await transformAndValidate(PostIndCollateReqDto, req.body);
        if (Array.isArray(dto)) {
            throw new AppError(message.REQUEST_IS_ARRAY, 400);
        }

        next();
    }
}
