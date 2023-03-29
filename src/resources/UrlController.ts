/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import PostUrlReqDto from './dto/PostUrlReqDto';
import PostUrlIssueReqDto from './dto/PostUrlIssueReqDto';
import PostUrlConfirmReqDto from './dto/PostUrlConfirmReqDto';
/* eslint-enable */
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import OperatorService from '../services/OperatorService';
import UrlService from '../services/UrlService';
import UrlRequestValidator from './validator/UrlRequestValidator';
import UrlIssueRequestValidator from './validator/UrlIssueRequestValidator';
import UrlConfirmRequestValidator from './validator/UrlConfirmRequestValidator';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';

@JsonController('/identity-verificate')
export default class UrlController {
    @Post('/url')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(UrlRequestValidator)
    async postUrl (@Req() req: Request, @Body() dto: PostUrlReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // URL発行を実行
        const ret = await UrlService.postUrl(operator, dto);

        // レスポンスを返す
        return ret;
    }

    @Post('/url/issue')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(UrlIssueRequestValidator)
    async postUrlIssue (@Req() req: Request, @Body() dto: PostUrlIssueReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // URL発行を実行
        const ret = await UrlService.postUrlIssue(operator, dto);

        // レスポンスを返す
        return ret;
    }

    @Post('/url/confirm')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(UrlConfirmRequestValidator)
    async postUrlConfirm (@Req() req: Request, @Body() dto: PostUrlConfirmReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // URL発行を実行
        const ret = await UrlService.postUrlConfirm(operator, dto);

        // レスポンスを返す
        return ret;
    }
}
