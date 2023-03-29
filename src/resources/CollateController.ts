/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import PostCollateReqDto from './dto/PostCollateReqDto';
import PostIndCollateReqDto from './dto/PostIndCollateReqDto';
/* eslint-enable */
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import OperatorService from '../services/OperatorService';
import CollateService from '../services/CollateService';
import ServiceDto from '../services/dto/CollateServiceDto';
import CollateRequestValidator from './validator/CollateRequestValidator';
import IndCollateRequestValidator from './validator/IndCollateRequestValidator';
import Operator from '../domains/OperatorDomain';
import { transformAndValidate } from 'class-transformer-validator';

@JsonController('/identity-verificate')
export default class CollateController {
    /**
     * 本人性確認コード照合
     * @param req
     * @param dto
     * @param res
     */
    @Post('/collate')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(CollateRequestValidator)
    async postCollate (@Req() req: Request, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // 本人性確認コード照合を実行
        let ret;
        if (operator.type === Operator.TYPE_PERSONAL_NUMBER) {
            const dto = await transformAndValidate(PostIndCollateReqDto, req.body) as PostIndCollateReqDto;
            // dtoに値を設定
            const serviceDto = new ServiceDto();
            serviceDto.setCode(dto.identifyCode);
            serviceDto.setPath(dto.path);
            ret = await CollateService.postIndCollate(operator, serviceDto);
        } else {
            const dto = await transformAndValidate(PostCollateReqDto, req.body) as PostCollateReqDto;
            // dtoに値を設定
            const serviceDto = new ServiceDto();
            serviceDto.setCode(dto.identifyCode);
            ret = await CollateService.postCollate(operator, serviceDto);
        }

        // レスポンスを返す
        return ret;
    }

    /**
     * 個人による本人性確認コード照合（非推奨）
     * @param req
     * @param dto
     * @param res
     */
    @Post('/ind/collate')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(IndCollateRequestValidator)
    async postIndCollate (@Req() req: Request, @Body() dto: PostIndCollateReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // dtoに値を設定
        const serviceDto = new ServiceDto();
        serviceDto.setCode(dto.identifyCode);
        serviceDto.setPath(dto.path);

        // 本人性確認コード照合を実行
        const ret = await CollateService.postIndCollate(operator, serviceDto);

        // レスポンスを返す
        return ret;
    }
}
