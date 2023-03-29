/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
/* eslint-enable */
import {
    JsonController, Get, Header, Res, Req
} from 'routing-controllers';
import OperatorService from '../services/OperatorService';
import AcquisitionService from '../services/AcquisitionService';
import ServiceDto from '../services/dto/AcquisitionServiceDto';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';

@JsonController('/identity-verificate')
export default class AcquisitionController {
    @Get('/acquisition/identification/:identifyCode')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    async getAcquisitionIdentificationByIdentifyCode (@Req() req: Request, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // dtoに値を設定
        const serviceDto = new ServiceDto();
        serviceDto.setCode(req.params.identifyCode);

        // 本人性確認事項取得を実行
        const ret = await AcquisitionService.getIdentification(operator, serviceDto);

        // レスポンスを返す
        return ret;
    }
}
