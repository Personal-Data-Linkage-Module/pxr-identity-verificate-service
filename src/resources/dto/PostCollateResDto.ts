/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import IdentifyVerifyEntity from '../../repositories/postgres/IdentifyVerifyEntity';
/* eslint-enable */

export default class PostCollateResDto {
    /**
     * PXR-ID
     */
    pxrId: string;

    /**
     * 利用者ID
     */
    userId: string;

    /**
     * アクターカタログオブジェクト
     */
    actor: {
        _value: number,
        _ver: number
    };

    /**
     * リージョンカタログオブジェクト
     */
    region?: {
        _value: number,
        _ver: number
    };

    /**
     * アプリケーションカタログオブジェクト
     */
    app?: {
        _value: number,
        _ver: number
    };

    /**
     * ワークフローカタログオブジェクト
     */
    wf?: {
        _value: number,
        _ver: number
    };

    /**
     * データエンティティから各値をセットする
     * @param entity
     */
    static parseEntity (entity: IdentifyVerifyEntity): PostCollateResDto {
        const res = new PostCollateResDto();
        res.pxrId = entity.pxrId;
        res.userId = entity.userId;
        res.actor = {
            _value: entity.actorCatalogCode,
            _ver: entity.actorCatalogVersion
        };
        if (entity.regionCatalogCode) {
            res.region = {
                _value: entity.regionCatalogCode,
                _ver: entity.regionCatalogVersion
            };
        }
        if (entity.applicationCatalogCode) {
            res.app = {
                _value: entity.applicationCatalogCode,
                _ver: entity.applicationCatalogVersion
            };
        }
        return res;
    }

    /**
     * レスポンス用のオブジェクトに変換する
     */
    public toJSON (): {} {
        const res: any = {
            pxrId: this.pxrId,
            userId: this.userId,
            actor: this.actor,
            region: this.region,
            app: this.app,
            wf: this.wf
        };
        return res;
    }
}
