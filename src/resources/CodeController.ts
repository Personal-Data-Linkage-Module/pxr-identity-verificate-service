/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import PostCodeReqDto from './dto/PostCodeReqDto';
import PostCodeVerifiedReqDto from './dto/PostCodeVerifiedReqDto';
/* eslint-enable */
import OperatorService from '../services/OperatorService';
import CodeService from '../services/CodeService';
import CodeRequestValidator from './validator/CodeRequestValidator';
import CodeVerifiedValidator from './validator/CodeVerifiedRequestValidator';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import Config from '../common/Config';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
const message = Config.ReadConfig('./config/message.json');

@JsonController('/identity-verificate')
export default class CodeController {
    // コード発行
    @Post('/code')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(CodeRequestValidator)
    async postCode (@Req() req: Request, @Body() dto: PostCodeReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // 本人性確認コード発行を実行
        const ret = await CodeService.postCode(operator, dto);

        // レスポンスを返す
        return ret;
    }

    // 確認済本人性確認コード生成
    @Post('/code/verified')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(CodeVerifiedValidator)
    async postCodeVerified (@Req() req: Request, @Body() dto: PostCodeVerifiedReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // BOOK開設権限がない場合
        if (!operator['auth'] ||
            !operator['auth']['book'] ||
            !operator['auth']['book']['create'] ||
            operator['auth']['book']['create'] !== true) {
            // エラーを返す
            throw new AppError(message.REQUEST_UNAUTORIZED, ResponseCode.UNAUTHORIZED);
        }

        // 本人性確認コード発行を実行
        const ret = await CodeService.postCodeVerified(operator, dto);

        // レスポンスを返す
        return ret;
    }
}
