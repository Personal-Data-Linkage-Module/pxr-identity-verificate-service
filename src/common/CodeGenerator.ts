/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { v4 as uuidv4 } from 'uuid';
import { Base64 } from 'js-base64';
/* eslint-enable */

/**
 * 本人性確認コード生成
 */
export async function identifyVerifyCode (): Promise<string> {
    const id = uuidv4();
    return Base64.encode(id);
}
