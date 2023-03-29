/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
export default class UserServiceDto {
    /**
     * 本人性確認コード
     */
    private code: string = null;

    /**
     * 利用者ID
     */
    private userId: string = null;

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
     * 利用者ID設定
     * @param userId
     */
    public setUserId (userId: string) {
        this.userId = userId;
    }

    /**
     * 利用者ID取得
     */
    public getUserId () : string {
        return this.userId;
    }
}
