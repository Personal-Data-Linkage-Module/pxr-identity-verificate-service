/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import IdentifyVerifyEntity from '../../repositories/postgres/IdentifyVerifyEntity';
/* eslint-enable */

export default class GetAcquisitionIdentificationResDto {
    /**
     * 利用者ID
     */
    public userId: string = null;

    /**
     * アクターカタログオブジェクト
     */
    public actor: object = null;

    /**
     * リージョンカタログオブジェクト
     */
    public region: object = null;

    /**
     * アプリケーションカタログオブジェクト
     */
    public app: object = null;

    /**
     * ワークフローカタログオブジェクト
     */
    public wf: object = null;

    /**
     * 本人性確認事項
     */
    public identification: any = null;

    /**
     * データエンティティから各値をセットする
     * @param entity
     */
    public parseEntity (entity: IdentifyVerifyEntity) {
        this.userId = entity.userId;
        const actor = {
            _value: entity.actorCatalogCode,
            _ver: entity.actorCatalogVersion
        };
        this.actor = actor;
        if (entity.regionCatalogCode) {
            this.region = {
                _value: entity.regionCatalogCode,
                _ver: entity.regionCatalogVersion
            };
        }
        if (entity.applicationCatalogCode) {
            this.app = {
                _value: entity.applicationCatalogCode,
                _ver: entity.applicationCatalogVersion
            };
        }
    }

    /**
     * レスポンス用のオブジェクトに変換する
     */
    public toJSON (): {} {
        const res: any = {
            userId: this.userId,
            actor: this.actor,
            region: this.region,
            app: this.app,
            wf: null,
            identification: this.identification
        };
        return res;
    }
}
