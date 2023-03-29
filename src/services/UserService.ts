/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import PostUserSettingsReqDto from '../resources/dto/PostUserSettingsReqDto';
/* eslint-enable */
import { Service } from 'typedi';
import Operator from '../domains/OperatorDomain';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { EntityOperation } from '../repositories/EntityOperation';
import IdentifyVerifyEntity from '../repositories/postgres/IdentifyVerifyEntity';
import PostUserSettingsResDto from '../resources/dto/PostUserSettingsResDto';
import BookManageService from './BookManageService';
import BookManageDto from './dto/BookManageDto';
import Config from '../common/Config';
const Message = Config.ReadConfig('./config/message.json');

@Service()
export default class UserService {
    /**
     * 利用者情報設定
     * @param operator
     * @param code
     */
    public static async postUserSettings (operator: Operator, dto: PostUserSettingsReqDto): Promise<any> {
        // dtoから値を取り出す
        const code = dto.getIdentifyCode();
        const userId = dto.getUserId();

        // リクエストオペレーターの種別が、運営メンバー, Appではない場合はエラーとする
        if (operator.type !== Operator.TYPE_APPLICATION_NUMBER &&
            operator.type !== Operator.TYPE_MANAGER_NUMBER
        ) {
            throw new AppError(Message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }

        // リクエストされた確認コードのエンティティを取得
        const entity = await EntityOperation.selectWithIdentifyCode(code);
        // REGION、APPのカタログコードチェック
        if (!entity.regionCatalogCode && !entity.applicationCatalogCode) {
            // REGION、APPどちらも登録されていないならエラーを返す
            throw new AppError(Message.UNSUPPORTED_ACTOR_CATALOG_CODE, ResponseCode.BAD_REQUEST);
        }
        // 有効期限が現在時刻を下回ったものであるか
        if (new Date().getTime() > entity.expirationAt.getTime()) {
            // 有効期限切れとしてエラーを返す
            throw new AppError(Message.EXPIRED, ResponseCode.BAD_REQUEST);
        }
        // ステータス確認、確認成功しているものは利用者IDの設定ができない
        if (entity.isVerified === IdentifyVerifyEntity.SUCCESS) {
            throw new AppError(Message.IS_VERIFIED, ResponseCode.BAD_REQUEST);
        }
        // レコードの申請アクターと同じアクターしか設定できない
        if (operator.actorCode !== Number(entity.actorCatalogCode)) {
            throw new AppError(Message.NOT_APPLIED_ACTOR, ResponseCode.BAD_REQUEST);
        }

        // 利用者ID設定用のデータをセット
        const bookManegeDto = new BookManageDto();
        bookManegeDto.setPxrId(entity.pxrId);
        bookManegeDto.setUserId(userId);
        bookManegeDto.setActorCode(Number(entity.actorCatalogCode));
        bookManegeDto.setActorVersion(Number(entity.actorCatalogVersion));
        if (entity.regionCatalogCode) {
            bookManegeDto.setRegionCode(Number(entity.regionCatalogCode));
            bookManegeDto.setRegionVersion(Number(entity.regionCatalogVersion));
        } else {
            bookManegeDto.setAppCode(Number(entity.applicationCatalogCode));
            bookManegeDto.setAppVersion(Number(entity.applicationCatalogVersion));
        }

        // BOOK管理サービス：利用者ID設定を実行
        const bookManage = new BookManageService();
        await bookManage.postCooperateUser(bookManegeDto, operator);

        // エンティティの利用者IDを更新、データベースへ保存
        entity.userId = userId;
        await EntityOperation.updateIdentifyVerifyEntity(entity, operator);

        return new PostUserSettingsResDto();
    }
}
