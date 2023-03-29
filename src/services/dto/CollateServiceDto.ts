/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
/* eslint-enable */

export default class CollateServiceDto {
    /**
     * 本人性確認コード
     */
    private code: string = null;

    /**
     * パス
     */
    private path: string = null;

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
     * 本人性確認コード設定
     * @param path
     */
    public setPath (path: string) {
        this.path = path;
    }

    /**
     * 本人性確認コード取得
     */
    public getPath () : string {
        return this.path;
    }
}
