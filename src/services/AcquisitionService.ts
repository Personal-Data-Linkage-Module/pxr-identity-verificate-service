/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import Operator from '../domains/OperatorDomain';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { EntityOperation } from '../repositories/EntityOperation';
import IdentifyVerifyEntity from '../repositories/postgres/IdentifyVerifyEntity';
import ServiceDto from './dto/AcquisitionServiceDto';
import ResDto from '../resources/dto/GetAcquisitionIdentificationResDto';
import { doPostRequest } from '../common/DoRequest';
import * as config from 'config';
import Config from '../common/Config';
import request = require('request');
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

@Service()
export default class AcquisitionService {
    /**
     * 本人性確認事項取得
     * @param operator
     * @param dto
     */
    public static async getIdentification (operator: Operator, dto: ServiceDto): Promise<any> {
        // dtoから値を取り出す
        const code = dto.getCode();

        // リクエストオペレーターの種別が、運営メンバー, Appではない場合はエラーとする
        if (operator.type !== Operator.TYPE_APPLICATION_NUMBER &&
            operator.type !== Operator.TYPE_MANAGER_NUMBER
        ) {
            throw new AppError(Message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }

        // リクエストされた確認コードのエンティティを取得
        const entity = await EntityOperation.selectWithIdentifyCode(code);

        // 有効期限が現在時刻を下回ったものであるか
        if (new Date().getTime() > entity.expirationAt.getTime()) {
            // 有効期限切れとしてエラーを返す
            throw new AppError(Message.EXPIRED, ResponseCode.BAD_REQUEST);
        }
        // ステータス確認、確認済みであるものは本人性確認事項の取得が行えない
        if (entity.isVerified === IdentifyVerifyEntity.SUCCESS) {
            throw new AppError(Message.IS_VERIFIED, ResponseCode.BAD_REQUEST);
        }
        // レコードの申請アクターと同じアクターしか設定できない
        if (operator.actorCode !== Number(entity.actorCatalogCode)) {
            throw new AppError(Message.NOT_APPLIED_ACTOR, ResponseCode.BAD_REQUEST);
        }

        // PXR-IDカラムでリクエストオブジェクトを生成する
        const data = JSON.stringify({
            pxrId: entity.pxrId
        });

        // オプションの生成
        const options: request.CoreOptions = {
            headers: {
                accept: 'application/json',
                'Content-Type': 'application/json',
                'Content-Length': Buffer.byteLength(data)
            },
            body: data
        };
        options.headers.session = operator.encoded;

        // My-Condition-Book管理へ、リクエストを実行
        const result = await doPostRequest(config.get('bookManage.identity'), options);
        const { statusCode } = result.response;
        // ステータスコードによる制御
        if (statusCode !== ResponseCode.OK) {
            throw new AppError(
                Message.FAILED_TAKE_IDENTIFICATION, ResponseCode.INTERNAL_SERVER_ERROR);
        }

        let parsed = result.body;
        while (typeof parsed === 'string') {
            parsed = JSON.parse(parsed);
        }

        // レスポンスを生成
        const response: ResDto = new ResDto();
        response.parseEntity(entity);
        response.identification = parsed.identification;

        return response;
    }
}
