/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import IdentifyVerifyEntity from '../../repositories/postgres/IdentifyVerifyEntity';
import Moment from '../../common/Moment';
/* eslint-enable */
import config = require('config');
import moment = require('moment-timezone');

export default class PostCodeVerifiedResDto {
    identifyCode: string;

    pxrId: string;

    userId: string;

    actor: {
        _value: number,
        _ver: number
    };

    region?: {
        _value: number,
        _ver: number
    };

    app?: {
        _value: number,
        _ver: number
    };

    expireAt: string;

    /**
     * データエンティティからレスポンス用オブジェクトに変換する
     * @param entity
     */
    static parseEntity (entity: IdentifyVerifyEntity): PostCodeVerifiedResDto {
        const res = new PostCodeVerifiedResDto();
        res.identifyCode = entity.code;
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
        res.expireAt = moment(entity.expirationAt).tz(config.get('timezone')).format(Moment.MOMENT_FORMAT);
        return res;
    }

    /**
     * レスポンス用のオブジェクトに変換する
     */
    public toJSON (): {} {
        const res: any = {
            identifyCode: this.identifyCode,
            pxrId: this.pxrId,
            userId: this.userId,
            actor: this.actor,
            expireAt: this.expireAt
        };
        if (this.region) {
            res.region = this.region;
        } else {
            res.app = this.app;
        }
        return res;
    }
}
