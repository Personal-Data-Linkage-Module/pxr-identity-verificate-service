/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Put, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import PutVerifyOthersByIdentifyCodeReqDto from './dto/PutVerifyOthersByIdentifyCodeReqDto';
/* eslint-enable */
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import VerifyRequestValidator from './validator/VerifyRequestValidator';
import OperatorService from '../services/OperatorService';
import VerifyService from '../services/VerifyService';
import ServiceDto from '../services/dto/VerifyServiceDto';

@JsonController('/identity-verificate')
export default class VerifyController {
    @Put('/verify/others/:identifyCode')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(VerifyRequestValidator)
    async putVerifyOthersByIdentifyCode (@Req() req: Request, @Body() dto: PutVerifyOthersByIdentifyCodeReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // dtoに値をセット
        const serviceDto = new ServiceDto();
        serviceDto.setCode(req.params.identifyCode);
        serviceDto.setStatus(parseInt(req.body.status));

        // 第三者による本人性確認を実行
        const ret = await VerifyService.putVerifyOthersByIdentifyCode(operator, serviceDto);

        // レスポンスを返す
        return ret;
    }
}
