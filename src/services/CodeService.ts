/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Service } from 'typedi';
import { sprintf } from 'sprintf-js';
import { Notification } from './NotificationService';
import { identifyVerifyCode } from '../common/CodeGenerator';
import Moment from '../common/Moment';
import Operator from '../domains/OperatorDomain';
import AppError from '../common/AppError';
import { ResponseCode } from '../common/ResponseCode';
import { EntityOperation } from '../repositories/EntityOperation';
import IdentifyVerifyEntity from '../repositories/postgres/IdentifyVerifyEntity';
import PostCodeReqDto from '../resources/dto/PostCodeReqDto';
import PostCodeResDto from '../resources/dto/PostCodeResDto';
import PostCodeVerifiedReqDto from '../resources/dto/PostCodeVerifiedReqDto';
import PostCodeVerifiedResDto from '../resources/dto/PostCodeVerifiedResDto';
/* eslint-enable */
import Config from '../common/Config';
import { sendMessage } from '../common/Sms_Stub';
import BookManageDto from './dto/BookManageDto';
import CatalogDto from './dto/CatalogDto';
import BookManageService from './BookManageService';
import CatalogService from './CatalogService';
import OperatorService from './OperatorService';
import configure = require('config');
const moment = require('moment-timezone');
const message = Config.ReadConfig('./config/message.json');
const config = Config.ReadConfig('./config/config.json');

@Service()
export default class CodeService {
    static readonly COOP_REQUEST: number = 0;
    static readonly COOPERATED: number = 1;
    static readonly COOP_RELEASE_REQUEST: number = 2;
    static readonly UNAVAILABLE: number = 3;
    static readonly GLOBAL_SETTING_NS: string = 'catalog/ext/%s/setting/global';

    /**
     * 本人性確認コード発行
     * @param operator
     * @param request
     * リファクタ履歴
     *  separate : searchAppRegionCatalog（region/appカタログ取得処理）
     *  separate : checkCoopStatusForPostCode（利用者連携ステータス確認処理）
     *  separate : requestCoopForPostCode（利用者ID連携申請処理）
     *  separate : identifyCodeNotificate（本人性確認コード発行通知処理）
     *  separate : insertIdentifyVerifyEntity（本人性確認コード登録処理）
     *  separate : sendSmsMessage（SMSメッセージ送付処理）
     */
    public static async postCode (operator: Operator, reqDto: PostCodeReqDto): Promise<any> {
        // 種別を確認、セッションのオペレーター種別が個人ではない場合、エラーとする
        if (operator.type !== Operator.TYPE_PERSONAL_NUMBER) {
            throw new AppError(message.PERMISSION_DENIED, ResponseCode.UNAUTHORIZED);
        }

        // REGION | APP カタログの検索
        const providerCatalog = await CodeService.searchAppRegionCatalog(reqDto, operator);

        // 確認コードの発行
        let code = await identifyVerifyCode();
        // 発行したコードの存在を確認する
        while (true) {
            try {
                // コードに重複がなかった場合はエラーが発生する
                await EntityOperation.selectWithIdentifyCode(code);
                // 確認コードを再発行
                code = await identifyVerifyCode();
                continue;
            } catch (err) {
                if (err.name !== AppError.NAME) {
                    // アプリケーション例外以外が発生したらスローする
                    throw err;
                }
                break;
            }
        }

        // 利用者ID連携済か確認する
        const { isCoopRequest, bookManage, isCoop, userId, books } = await CodeService.checkCoopStatusForPostCode(operator, reqDto);

        // configよりnsを取得して有効期限を設定する
        const catalogService = new CatalogService();
        const catalogDto = new CatalogDto();
        catalogDto.setOperator(operator);
        const name = await catalogService.getCatalog(catalogDto);
        catalogDto.setNs(sprintf(this.GLOBAL_SETTING_NS, name['ext_name']));
        const initialPasswordExpire: number = 7;
        const expire = new Date();
        expire.setDate(expire.getDate() + initialPasswordExpire);

        // 利用者ID連携申請
        await CodeService.requestCoopForPostCode(isCoopRequest, reqDto, bookManage, operator, isCoop);

        // オペレーターサービス：本人性確認コード登録
        await OperatorService.postIdentifyCode(operator, code, moment(expire).tz(configure.get('timezone')).format(Moment.MOMENT_FORMAT));

        // REGIONに関連したコード発行依頼であれば、処理を制御する -> 設定値は後で要確認
        await CodeService.identifyCodeNotificate(reqDto, isCoop, providerCatalog, code, operator);

        // 登録用のエンティティを生成
        const entity = await CodeService.insertIdentifyVerifyEntity(code, reqDto, operator, expire, isCoop, userId);

        // SMSメッセージ送付
        await this.sendSmsMessage(books, code);

        // レスポンスを生成、処理を終了
        return PostCodeResDto.parseEntity(entity);
    }

    /**
     * SMSメッセージ送付処理
     * @param books
     * @param code
     */
    private static async sendSmsMessage (books: any, code: string) {
        // 電話番号が存在すれば、SMSを送付する
        let phoneNumber = null;
        for (const book of books) {
            if (book['userInformation']) {
                if (book['userInformation']['item-group'] && Array.isArray(book['userInformation']['item-group'])) {
                    for (const itemGroup of book['userInformation']['item-group']) {
                        if (itemGroup['item'] && Array.isArray(itemGroup['item'])) {
                            for (const item of itemGroup['item']) {
                                if (Number(config['code']['phoneNumber']) === Number(item['type']['_value'])) {
                                    phoneNumber = item['content'];
                                    break;
                                }
                            }
                        }
                        if (phoneNumber) {
                            break;
                        }
                    }
                }
                if (phoneNumber) {
                    break;
                }
            }
        }
        if (phoneNumber) {
            phoneNumber = config['sms']['countryCode'] + (p => {
                if (p.indexOf('0') === 0) {
                    return p.substring(1);
                }
                return p;
            })(phoneNumber);
            await sendMessage(message.NOTICE_IDENTIFY_CODE, phoneNumber);
            await sendMessage(code, phoneNumber);
        }
    }

    /**
     * 本人性確認コード登録処理
     * @param code
     * @param reqDto
     * @param operator
     * @param expire
     * @param isCoop
     * @param userId
     * @returns
     */
    private static async insertIdentifyVerifyEntity (code: string, reqDto: any, operator: Operator, expire: Date, isCoop: boolean, userId: any) {
        let entity = new IdentifyVerifyEntity();
        entity.code = code;
        entity.actorCatalogCode = reqDto.actor._value;
        entity.actorCatalogVersion = reqDto.actor._ver;
        if (reqDto.region) {
            entity.regionCatalogCode = reqDto.region._value;
            entity.regionCatalogVersion = reqDto.region._ver;
        }
        if (reqDto.app) {
            entity.applicationCatalogCode = reqDto.app._value;
            entity.applicationCatalogVersion = reqDto.app._ver;
        }
        entity.pxrId = reqDto.pxrId || operator.pxrId;
        entity.expirationAt = moment(expire).tz(configure.get('timezone')).format(Moment.MOMENT_FORMAT);
        if (isCoop) {
            entity.isVerified = 1;
            entity.userId = userId;
        } else {
            entity.isVerified = 0;
            entity.userId = null;
        }
        // 生成したエンティティをデータベースに登録する
        entity = await EntityOperation.saveIdentifyVerifyEntity(entity, operator);
        return entity;
    }

    /**
     * 本人性確認コード発行通知処理
     * @param reqDto
     * @param isCoop
     * @param providerCatalog
     * @param code
     * @param operator
     */
    private static async identifyCodeNotificate (reqDto: PostCodeReqDto, isCoop: boolean, providerCatalog: CatalogService, code: string, operator: Operator, verifiedFlg = false) {
        const coopCategoryCode = 145;
        const coopCategoryVersion = 1;
        const cancelCoopCategoryCode = 181;
        const cancelCoopCategoryVersion = 1;
        if (!reqDto.app) {
            // 通知サービスを介して、運営へ連携する
            const notice = new Notification();
            if (isCoop) {
                notice.title = '連携解除用本人性確認コード発行';
                notice.content = message.NOTIFICATION_COOPERATE_RELEASE_REQUEST;
                notice.destinationBlockCode = providerCatalog.mainBlockCode;
                notice.destinationOperatorType = Operator.TYPE_MANAGER_NUMBER;
                notice.categoryCode = cancelCoopCategoryCode;
                notice.categoryVersion = cancelCoopCategoryVersion;
                notice.attribute = {
                    identifyCode: code,
                    verifiedFlg: verifiedFlg
                };
            } else {
                notice.title = '連携用本人性確認コード発行';
                notice.content = message.NOTIFICATION_COOPERATE_REQUEST;
                notice.destinationBlockCode = providerCatalog.mainBlockCode;
                notice.destinationOperatorType = Operator.TYPE_MANAGER_NUMBER;
                notice.categoryCode = coopCategoryCode;
                notice.categoryVersion = coopCategoryVersion;
                notice.attribute = {
                    identifyCode: code,
                    verifiedFlg: verifiedFlg
                };
            }
            // 通知サービスへデータを登録
            await notice.addRequest(operator);
        }
    }

    /**
     * 利用者ID連携申請
     * @param isCoopRequest
     * @param reqDto
     * @param bookManage
     * @param operator
     * @param isCoop
     */
    private static async requestCoopForPostCode (isCoopRequest: boolean, reqDto: PostCodeReqDto, bookManage: BookManageService, operator: Operator, isCoop: boolean) {
        if (isCoopRequest === false) {
            // 利用者ID連携申請用のデータをセット
            const bookManegeDto = new BookManageDto();
            bookManegeDto.setActorCode(reqDto.actor._value);
            bookManegeDto.setActorVersion(reqDto.actor._ver);
            if (reqDto.region) {
                bookManegeDto.setRegionCode(reqDto.region._value);
                bookManegeDto.setRegionVersion(reqDto.region._ver);
            }
            if (reqDto.app) {
                bookManegeDto.setAppCode(reqDto.app._value);
                bookManegeDto.setAppVersion(reqDto.app._ver);
            }

            // BOOK管理サービス：利用者ID連携申請を実行
            await bookManage.postCooperateRequest(bookManegeDto, operator, isCoop);
        }
    }

    /**
     * 利用者連携ステータスを確認する
     * @param operator
     * @param reqDto
     * @returns
     */
    private static async checkCoopStatusForPostCode (operator: Operator, reqDto: PostCodeReqDto) {
        const bookManageSearchDto = new BookManageDto();
        bookManageSearchDto.setPxrId(operator.pxrId);

        // BOOK管理サービス：利用者ID連携取得を実行
        const bookManage = new BookManageService();
        const books = await bookManage.postSearch(bookManageSearchDto, operator);

        let isCoop = false;
        let isCoopRequest = false;
        let userId = null;
        for (const book of books) {
            if (book['cooperation'] && Array.isArray(book['cooperation'])) {
                for (const cooperation of book['cooperation']) {
                    if (reqDto.actor._value === Number(cooperation['actor']['_value']) &&
                        ((cooperation['region'] && reqDto.region._value === Number(cooperation['region']['_value'])) ||
                            (cooperation['app'] && reqDto.app._value === Number(cooperation['app']['_value'])) ||
                            (cooperation['region'] === null && cooperation['app'] === null))) {
                        if (this.COOP_REQUEST === Number(cooperation['status'])) {
                            // 利用者ID連携が申請中の場合は、本人性確認コード再発行
                            isCoopRequest = true;
                        } else if (this.COOPERATED === Number(cooperation['status'])) {
                            // 連携中の場合は、連携解除申請用のコード発行
                            isCoop = true;
                            userId = cooperation['userId'];
                        } else if (this.COOP_RELEASE_REQUEST === Number(cooperation['status'])) {
                            // 連携解除申請中の場合は、連携解除申請用コード再発行
                            isCoopRequest = true;
                            isCoop = true;
                            userId = cooperation['userId'];
                        }
                    }
                }
            }
        }
        return { isCoopRequest, bookManage, isCoop, userId, books };
    }

    /**
     * Region/APPカタログ検索
     * @param reqDto
     * @param operator
     * @returns
     */
    private static async searchAppRegionCatalog (reqDto: PostCodeReqDto, operator: Operator) {
        const defineCatalog = new CatalogService();
        // REGION | APP カタログの検索
        if (reqDto.region || reqDto.app) {
            // nsからactorコード取得用の正規表現
            let regex: RegExp;
            if (reqDto.region) {
                defineCatalog.code = reqDto.region._value;
                await CodeService.checkRegionOpen(reqDto, operator);
                regex = /^catalog\/(model|built_in|ext\/.*)\/actor\/region-root\/actor_(?<actor>[0-9]*)\/region/;
            } else {
                defineCatalog.code = reqDto.app._value;
                regex = /^catalog\/(model|built_in|ext\/.*)\/actor\/app\/actor_(?<actor>[0-9]*)\/application/;
            }
            await defineCatalog.search(operator);
            const ns = defineCatalog.data.catalogItem.ns;
            const found = ns.match(regex);
            if (!found || Number(found.groups.actor) !== Number(reqDto.actor._value)) {
                // NSとアクターのカタログコードが異なる場合、エラーとする
                throw new AppError(message.INVALID_ACTOR_CATALOG, ResponseCode.BAD_REQUEST);
            }
        }

        const providerCatalog = new CatalogService();
        providerCatalog.code = reqDto.actor._value;
        await providerCatalog.search(operator);
        return providerCatalog;
    }

    /**
     * 確認済本人性確認コード生成
     * @param operator
     * @param request
     * リファクタ履歴
     *  separate : checkCoopStatusForPostCodeVerified（利用者連携ステータス確認処理）
     *  separate : requestCoopForPostCodeVerified（利用者ID連携申請処理）
     */
    public static async postCodeVerified (operator: Operator, reqDto: PostCodeVerifiedReqDto): Promise<any> {
        const defineCatalog = new CatalogService();
        // APP | REGION カタログの検索
        if (reqDto.app || reqDto.region) {
            defineCatalog.code = reqDto.app ? reqDto.app._value : reqDto.region._value;
            await defineCatalog.search(operator);
        }

        const providerCatalog = new CatalogService();
        providerCatalog.code = reqDto.actor._value;
        await providerCatalog.search(operator);

        // 確認コードの発行
        let code = await identifyVerifyCode();
        // 発行したコードの存在を確認する
        while (true) {
            try {
                // コードに重複がなかった場合はエラーが発生する
                await EntityOperation.selectWithIdentifyCode(code);
                // 確認コードを再発行
                code = await identifyVerifyCode();
                continue;
            } catch (err) {
                if (err.name !== AppError.NAME) {
                    // アプリケーション例外以外が発生したらスローする
                    throw err;
                }
                break;
            }
        }

        // 利用者ID連携済か確認する
        var { isCoopRequest, bookManage, isCoop } = await CodeService.checkCoopStatusForPostCodeVerified(reqDto, operator);

        // configよりnsを取得して有効期限を設定する
        const catalogService = new CatalogService();
        const catalogDto = new CatalogDto();
        catalogDto.setOperator(operator);
        const name = await catalogService.getCatalog(catalogDto);
        catalogDto.setNs(sprintf(this.GLOBAL_SETTING_NS, name['ext_name']));
        const initialPasswordExpire: number = 7;
        const expire = new Date();
        expire.setDate(expire.getDate() + initialPasswordExpire);

        // 利用者ID連携申請
        await this.requestCoopForPostCodeVerified(isCoopRequest, operator, reqDto, bookManage, isCoop);

        // Regionに関連したコード発行依頼、かつ連携解除申請でない場合は、通知を送信する
        if (reqDto.region && !isCoop) {
            await CodeService.identifyCodeNotificate(reqDto, isCoop, providerCatalog, code, operator, true);
        }

        const entity = await this.insertIdentifyVerifyEntity(code, reqDto, operator, expire, true, reqDto.userId);

        // レスポンスを生成、処理を終了
        return PostCodeVerifiedResDto.parseEntity(entity);
    }

    /**
     * 利用者連携ステータスを確認する
     * @param reqDto
     * @param operator
     * @returns
     */
    private static async checkCoopStatusForPostCodeVerified (reqDto: PostCodeVerifiedReqDto, operator: Operator) {
        const bookManageSearchDto = new BookManageDto();
        bookManageSearchDto.setPxrId(reqDto.pxrId);

        // BOOK管理サービス：利用者ID連携取得を実行
        const bookManage = new BookManageService();
        const books = await bookManage.postSearch(bookManageSearchDto, operator);

        let isCoop = false;
        let isCoopRequest = false;
        for (const book of books) {
            if (book['cooperation'] && Array.isArray(book['cooperation'])) {
                for (const cooperation of book['cooperation']) {
                    if (reqDto.actor._value === Number(cooperation['actor']['_value']) &&
                        ((cooperation['region'] && reqDto.region._value === Number(cooperation['region']['_value'])) ||
                            (cooperation['app'] && reqDto.app._value === Number(cooperation['app']['_value'])) ||
                            (cooperation['region'] === null && cooperation['app'] === null))) {
                        if (this.COOP_REQUEST === Number(cooperation['status'])) {
                            // 利用者ID連携が申請中の場合は、本人性確認コード再発行
                            isCoopRequest = true;
                        } else if ((this.COOPERATED === Number(cooperation['status']) || this.UNAVAILABLE === Number(cooperation['status']))) {
                            // 連携中or無効の場合は、連携解除申請用のコード発行
                            isCoop = true;
                        } else if (this.COOP_RELEASE_REQUEST === Number(cooperation['status'])) {
                            // 連携解除申請中の場合は、連携解除申請用コード再発行
                            isCoopRequest = true;
                            isCoop = true;
                        }
                    }
                }
            }
        }
        return { isCoopRequest, bookManage, isCoop };
    }

    /**
     * 利用者ID連携申請
     * @param isCoopRequest
     * @param operator
     * @param reqDto
     * @param bookManage
     * @param isCoop
     */
    private static async requestCoopForPostCodeVerified (isCoopRequest: boolean, operator: Operator, reqDto: PostCodeVerifiedReqDto, bookManage: BookManageService, isCoop: boolean) {
        if (isCoopRequest === false) {
            // 利用者ID連携申請用のデータをセット
            const bookManegeDto = new BookManageDto();
            if (operator.type === Operator.TYPE_MANAGER_NUMBER) {
                bookManegeDto.setPxrId(reqDto.pxrId);
            }
            bookManegeDto.setActorCode(reqDto.actor._value);
            bookManegeDto.setActorVersion(reqDto.actor._ver);
            if (reqDto.region) {
                bookManegeDto.setRegionCode(reqDto.region._value);
                bookManegeDto.setRegionVersion(reqDto.region._ver);
            }
            if (reqDto.app) {
                bookManegeDto.setAppCode(reqDto.app._value);
                bookManegeDto.setAppVersion(reqDto.app._ver);
            }
            bookManegeDto.setUserId(reqDto.userId);

            // BOOK管理サービス：利用者ID連携申請を実行
            await bookManage.postCooperateRequest(bookManegeDto, operator, isCoop);
        }
    }

    /**
     * Region開始チェック
     * @param reqDto
     * @param operator
     */
    private static async checkRegionOpen (reqDto: PostCodeReqDto, operator: Operator) {
        // Regionカタログを取得する
        const catalogService = new CatalogService();
        catalogService.code = reqDto.region._value;
        catalogService.version = reqDto.region._ver;
        await catalogService.search(operator);

        if (catalogService.data['template']['status'] !== 'open') {
            // 開始申請前のRegionの場合、エラーとする
            throw new AppError(message.REGION_NOT_OPEN, ResponseCode.BAD_REQUEST);
        }
    }
}
