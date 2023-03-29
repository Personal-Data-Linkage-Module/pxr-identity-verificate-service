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

import { IsString, IsNumber } from 'class-validator';

export default class PostUrlIssueReqDto {
    // 利用者ID
    @IsString()
    userId: string = '';

    // URLタイプ
    @IsNumber()
    urlType: number = null;
}
