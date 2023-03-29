/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import ServiceDto from './dto/VerifyServiceDto';
/* eslint-enable */
import { Service } from 'typedi';
import Operator from '../domains/OperatorDomain';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { EntityOperation } from '../repositories/EntityOperation';
import PutVerifyOthersByIdentifyCodeResDto from '../resources/dto/PutVerifyOthersByIdentifyCodeResDto';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

@Service()
export default class VerifyService {
    /**
     * 第三者による本人性確認
     * @param operator
     * @param dto
     */
    public static async putVerifyOthersByIdentifyCode (operator: Operator, dto: ServiceDto): Promise<any> {
        // dtoから値を取り出す
        const code = dto.getCode();
        const status = dto.getStatus();

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
        // 利用者IDが設定されていないものは確認ができない
        if (!entity.userId) {
            throw new AppError(Message.NO_USERID, ResponseCode.BAD_REQUEST);
        }
        // レコードの申請アクターと同じアクターしか確認
        if (operator.actorCode !== Number(entity.actorCatalogCode)) {
            throw new AppError(Message.NOT_APPLIED_ACTOR, ResponseCode.BAD_REQUEST);
        }

        // エンティティへステータスを設定
        entity.isVerified = status;
        // テーブルの更新を行う
        await EntityOperation.updateIdentifyVerifyEntity(entity, operator);

        return new PutVerifyOthersByIdentifyCodeResDto();
    }
}
