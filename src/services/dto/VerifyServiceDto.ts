/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
export default class VerifyServiceDto {
    /**
     * 本人性確認コード
     */
    private code: string = null;

    /**
     * ステータス
     */
    private status: number = null;

    /**
     * 本人性確認コード設定
     * @param code
     */
    public setCode (code: string) {
        this.code = code;
    }

    /**
     * 本人性確認コード取得
     */
    public getCode () : string {
        return this.code;
    }

    /**
     * ステータス設定
     * @param status
     */
    public setStatus (status: number) {
        this.status = status;
    }

    /**
     * ステータス取得
     */
    public getStatus () : number {
        return this.status;
    }
}
