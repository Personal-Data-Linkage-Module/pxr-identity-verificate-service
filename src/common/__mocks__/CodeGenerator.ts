/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/**
 * 本人性確認コード生成
 */
let i = 0;
export async function identifyVerifyCode (): Promise<string> {
    if (i === 0) {
        i++;
        return 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx';
    } else if (i === 1) {
        i++;
        return 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx';
    } else if (i === 2) {
        i++;
        return 'ABYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1';
    } else {
        i++;
        return 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1';
    }
}
