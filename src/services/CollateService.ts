/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import ServiceDto from './dto/CollateServiceDto';
/* eslint-enable */
import { Service } from 'typedi';
import Operator from '../domains/OperatorDomain';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { EntityOperation } from '../repositories/EntityOperation';
import IdentifyVerifyEntity from '../repositories/postgres/IdentifyVerifyEntity';
import PostCollateResDto from '../resources/dto/PostCollateResDto';
import Config from '../common/Config';
import BookManageDto from './dto/BookManageDto';
import BookManageService from './BookManageService';
const message = Config.ReadConfig('./config/message.json');

@Service()
export default class CollateService {
    /** 確認済ステータス */
    static readonly CONFIRMED_STATUS = 1;
    /**
     * 本人性確認コード照合
     * @param operator
     * @param code
     */
    public static async postCollate (operator: Operator, dto: ServiceDto): Promise<any> {
        // dtoから値を取り出す
        const code = dto.getCode();

        // リクエストオペレーターの種別が、運営メンバー, Appではない場合はエラーとする
        if (operator.type !== Operator.TYPE_APPLICATION_NUMBER &&
            operator.type !== Operator.TYPE_MANAGER_NUMBER
        ) {
            throw new AppError(message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }
        // コードと一致するエンティティをデータベースから取り出す
        const entity = await EntityOperation.selectWithIdentifyCode(code);
        // 有効期限が現在時刻を下回ったものであるか
        if (new Date().getTime() > entity.expirationAt.getTime()) {
            // 有効期限切れとしてエラーを返す
            throw new AppError(message.EXPIRED, ResponseCode.BAD_REQUEST);
        }
        // 確認フラグが、確認済みの値であるかを確認、それ以外であればエラー
        if (entity.isVerified !== IdentifyVerifyEntity.SUCCESS) {
            throw new AppError(message.IS_NOT_VERIFIED, ResponseCode.BAD_REQUEST);
        }

        // レスポンスを生成
        return PostCollateResDto.parseEntity(entity);
    }

    /**
     * 個人による本人性確認コード照合
     * @param operator
     * @param code
     */
    public static async postIndCollate (operator: Operator, dto: ServiceDto): Promise<any> {
        // dtoから値を取り出す
        const code = dto.getCode();
        const path = dto.getPath();

        // リクエストオペレーターの種別が、個人ではない場合はエラーとする
        if (operator.type !== Operator.TYPE_PERSONAL_NUMBER) {
            throw new AppError(message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }
        // コードと一致するエンティティをデータベースから取り出す
        const entity = await EntityOperation.selectWithIdentifyCode(code);
        if (!entity.regionCatalogCode && !entity.applicationCatalogCode) {
            // REGION、APPどちらも登録されていないならエラーを返す
            throw new AppError(message.UNSUPPORTED_ACTOR_CATALOG_CODE, ResponseCode.BAD_REQUEST);
        }
        if (new Date().getTime() > entity.expirationAt.getTime()) {
            // 有効期限切れの場合エラーを返す
            throw new AppError(message.EXPIRED, ResponseCode.BAD_REQUEST);
        }
        if (entity.pxrId !== operator.pxrId) {
            // PXR-IDが一致しない場合
            throw new AppError(message.NOT_MATCH_PXR_ID, ResponseCode.BAD_REQUEST);
        }

        if (path) {
            const urlEntity = await EntityOperation.getUrlByCode(path);
            // 有効期限が現在時刻を下回ったものであるか
            if (new Date().getTime() > urlEntity.expirationAt.getTime()) {
                // 有効期限切れとしてエラーを返す
                throw new AppError(message.EXPIRED, ResponseCode.BAD_REQUEST);
            }

            entity.userId = urlEntity.userId;
            await EntityOperation.updateIdentifyVerifyEntity(entity, operator);

            // エンティティの利用者IDを更新、データベースへ保存
            // 利用者ID設定用のデータをセット
            const bookManegeDto = new BookManageDto();
            bookManegeDto.setPxrId(entity.pxrId);
            bookManegeDto.setUserId(urlEntity.userId);
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
        }

        // エンティティへステータスを設定
        entity.isVerified = IdentifyVerifyEntity.SUCCESS;
        // テーブルの更新を行う
        await EntityOperation.updateIdentifyVerifyEntity(entity, operator);

        // レスポンスを生成
        return PostCollateResDto.parseEntity(entity);
    }
}
