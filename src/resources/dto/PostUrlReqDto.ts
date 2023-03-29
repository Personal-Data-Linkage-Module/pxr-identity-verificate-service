/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 *
 *
 *
 * $Date$
 * $Revision$
 * $Author$
 *
 * TEMPLATE VERSION :  76463
 */

// SDE-IMPL-REQUIRED 本ファイルをコピーしコントローラーに定義した各 REST API のリクエスト・レスポンスごとにDTOを作成します。

// import { IsUUID, IsString, IsNumber, IsDateString } from 'class-validator';

export default class PostUrlReqDto {
    /** */
    //    @IsString()
    identifyCode: string = '';
    /** */
    //    @IsString()
    userId: string = '';
    /** */
    //    @IsNumber()
    urlType: number = null;

    public getIdentifyCode (): string {
        return this.identifyCode;
    }

    public setIdentifyCode (identifyCode: string): void {
        this.identifyCode = identifyCode;
    }

    public getUserId (): string {
        return this.userId;
    }

    public setUserId (userId: string): void {
        this.userId = userId;
    }

    public getUrlType (): number {
        return this.urlType;
    }

    public setUrlType (urlType: number): void {
        this.urlType = urlType;
    }
}
