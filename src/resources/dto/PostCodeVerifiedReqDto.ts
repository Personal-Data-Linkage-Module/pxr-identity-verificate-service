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

export default class PostCodeVerifiedReqDto {
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

    wf?: {
        _value: number,
        _ver: number
    };
}
