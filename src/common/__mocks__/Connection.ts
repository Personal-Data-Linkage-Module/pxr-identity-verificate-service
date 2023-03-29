/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Connection } from 'typeorm';
/* eslint-enable */
import IdentifyVerifyEntity from '../../repositories/postgres/IdentifyVerifyEntity';
import fs = require('fs');

// 環境ごとにconfigファイルを読み込む
let connectOption: any = null;
connectOption = JSON.parse(fs.readFileSync('./config/ormconfig.json', 'utf-8'));

// エンティティを設定
connectOption['entities'] = [
    IdentifyVerifyEntity
];

/**
 * コネクションの生成
 */
export async function connectDatabase (): Promise<Connection> {
    return null;
}
