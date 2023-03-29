/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
/* eslint-enable */

/**
 * My-Condition-Book管理サービスデータ
 */
export default class BookManageDto {
    /**
     * アクターカタログコード
     */
    private actorCode: number = null;

    /**
     * アクターカタログバージョン
     */
    private actorVersion: number = null;

    /**
     * リージョンカタログコード
     */
    private regionCode: number = null;

    /**
     * リージョンカタログバージョン
     */
    private regionVersion: number = null;

    /**
     * アプリケーションカタログコード
     */
    private appCode: number = null;

    /**
     * アプリケーションカタログバージョン
     */
    private appVersion: number = null;

    /**
     * PXR-ID
     */
    private pxrId: string = null;

    /**
     * 本人性確認コード
     */
    private identifyCode: string = null;

    /**
     * 利用者ID
     */
    private userId: string = null;

    public getActorCode (): number {
        return this.actorCode;
    }

    public setActorCode (actorCode: number) {
        this.actorCode = actorCode;
    }

    public getActorVesion (): number {
        return this.actorVersion;
    }

    public setActorVersion (actorVersion: number) {
        this.actorVersion = actorVersion;
    }

    public getRegionCode (): number {
        return this.regionCode;
    }

    public setRegionCode (regionCode: number) {
        this.regionCode = regionCode;
    }

    public getRegionVersion (): number {
        return this.regionVersion;
    }

    public setRegionVersion (regionVersion: number) {
        this.regionVersion = regionVersion;
    }

    public getAppCode (): number {
        return this.appCode;
    }

    public setAppCode (appCode: number) {
        this.appCode = appCode;
    }

    public getAppVersion (): number {
        return this.appVersion;
    }

    public setAppVersion (appVersion: number) {
        this.appVersion = appVersion;
    }

    public getPxrId (): string {
        return this.pxrId;
    }

    public setPxrId (pxrId: string) {
        this.pxrId = pxrId;
    }

    public getUserId (): string {
        return this.userId;
    }

    public setUserId (userId: string) {
        this.userId = userId;
    }

    public getIdentifyCode (): string {
        return this.identifyCode;
    }

    public setIdentifyCode (identifyCode: string) {
        this.identifyCode = identifyCode;
    }
}
