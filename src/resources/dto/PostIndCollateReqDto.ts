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

import { IsString, IsNotEmpty, IsDefined, IsOptional } from 'class-validator';

export default class PostIndCollateReqDto {
    /** 本人性確認コード */
    @IsString()
    @IsNotEmpty()
    @IsDefined()
    identifyCode: string;

    /** パス */
    @IsString()
    @IsOptional()
    path: string;
}
