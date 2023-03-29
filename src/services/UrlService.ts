/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import PostUrlReqDto from '../resources/dto/PostUrlReqDto';
import PostUrlIssueReqDto from '../resources/dto/PostUrlIssueReqDto';
import PostUrlConfirmReqDto from '../resources/dto/PostUrlConfirmReqDto';
/* eslint-enable */
import { Service } from 'typedi';
import Operator from '../domains/OperatorDomain';
import AppError from '../common/AppError';
import Config from '../common/Config';
import { identifyVerifyCode } from '../common/CodeGenerator';
import { ResponseCode } from '../common/ResponseCode';
import { EntityOperation } from '../repositories/EntityOperation';
import { sprintf } from 'sprintf-js';
import IdentifyVerifyEntity from '../repositories/postgres/IdentifyVerifyEntity';
import IdentifyVerifyUrlEntity from '../repositories/postgres/IdentifyVerifyUrlEntity';
import PostUrlResDto from '../resources/dto/PostUrlResDto';
import BookManageDto from './dto/BookManageDto';
import BookManageService from './BookManageService';
import PostUrlIssueResDto from '../resources/dto/PostUrlIssueResDto';
import PostUrlConfirmResDto from '../resources/dto/PostUrlConfirmResDto';
const config = Config.ReadConfig('./config/config.json');
const message = Config.ReadConfig('./config/message.json');

@Service()
export default class UrlService {
    /** 発行URL種別: 本人用 */
    public static readonly ISSUE_URL_TYPE_PRINCIPAL = 0;
    /** 発行URL種別: 第三者用 */
    public static readonly ISSUE_URL_TYPE_THIRD = 1;

    /**
     * URL発行（旧）
     * @param operator
     * @param dto
     */
    public static async postUrl (operator: Operator, dto: PostUrlReqDto): Promise<any> {
        // リクエストオペレーターの種別が、運営メンバー, Appではない場合はエラーとする
        if (
            operator.type !== Operator.TYPE_APPLICATION_NUMBER &&
            operator.type !== Operator.TYPE_MANAGER_NUMBER
        ) {
            throw new AppError(message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }

        // リクエストされた確認コードのエンティティを取得
        const entity = await EntityOperation.selectWithIdentifyCode(dto.getIdentifyCode());
        // REGION、APPのカタログコードチェック
        if (!entity.regionCatalogCode && !entity.applicationCatalogCode) {
            // REGION、APPどちらも登録されていないならエラーを返す
            throw new AppError(message.UNSUPPORTED_ACTOR_CATALOG_CODE, ResponseCode.BAD_REQUEST);
        }
        // 有効期限が現在時刻を下回ったものであるか
        if (new Date().getTime() > entity.expirationAt.getTime()) {
            // 有効期限切れとしてエラーを返す
            throw new AppError(message.EXPIRED, ResponseCode.BAD_REQUEST);
        }
        // ステータス確認、確認成功しているものは利用者IDの設定ができない
        if (entity.isVerified === IdentifyVerifyEntity.SUCCESS) {
            throw new AppError(message.IS_VERIFIED, ResponseCode.BAD_REQUEST);
        }
        // レコードの申請アクターと同じアクターしか設定できない
        if (operator.actorCode !== Number(entity.actorCatalogCode)) {
            throw new AppError(message.NOT_APPLIED_ACTOR, ResponseCode.BAD_REQUEST);
        }
        // エンティティの利用者IDを更新、データベースへ保存
        if (dto.getUserId()) {
            // 利用者ID設定用のデータをセット
            const bookManegeDto = new BookManageDto();
            bookManegeDto.setPxrId(entity.pxrId);
            bookManegeDto.setUserId(dto.getUserId());
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

            entity.userId = dto.getUserId();
            await EntityOperation.updateIdentifyVerifyEntity(entity, operator);
        }

        // レスポンスを生成
        const response: PostUrlResDto = new PostUrlResDto();
        // URLを生成
        response.url = sprintf(config['redirectUrl'], dto.getIdentifyCode());

        return response;
    }

    /**
     * URL発行
     * @param operator
     * @param dto
     */
    public static async postUrlIssue (operator: Operator, dto: PostUrlIssueReqDto): Promise<any> {
        // リクエストオペレーターの種別が、運営メンバー, Appではない場合はエラーとする
        if (
            operator.type !== Operator.TYPE_APPLICATION_NUMBER
        ) {
            throw new AppError(message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }

        const entity = new IdentifyVerifyUrlEntity();
        entity.code = await identifyVerifyCode();
        entity.type = dto.urlType;
        entity.actorCatalogCode = operator.actorCode;
        entity.actorCatalogVersion = operator.actorVersion;
        entity.applicationCatalogCode = operator.roles[0]._value;
        entity.applicationCatalogVersion = operator.roles[0]._ver;
        entity.userId = dto.userId;
        const now = new Date();
        const defaultExpire = 10;
        now.setMinutes(now.getMinutes() + defaultExpire);
        entity.expirationAt = now;
        await EntityOperation.saveIdentifyVerifyUrlEntity(entity, operator);

        // レスポンスを生成
        const response: PostUrlIssueResDto = new PostUrlIssueResDto();
        // URLを生成
        response.url = sprintf(config['redirectUrl'], entity.code);

        return response;
    }

    /**
     * URL確認
     * @param operator
     * @param dto
     */
    public static async postUrlConfirm (operator: Operator, dto: PostUrlConfirmReqDto): Promise<any> {
        const entity = await EntityOperation.getUrlByCode(dto.path);
        // 有効期限が現在時刻を下回ったものであるか
        if (new Date().getTime() > entity.expirationAt.getTime()) {
            // 有効期限切れとしてエラーを返す
            throw new AppError(message.EXPIRED, ResponseCode.BAD_REQUEST);
        }

        // レスポンスを生成
        const response: PostUrlConfirmResDto = new PostUrlConfirmResDto();
        // URLを生成
        response.result = 'success';
        return response;
    }
}
