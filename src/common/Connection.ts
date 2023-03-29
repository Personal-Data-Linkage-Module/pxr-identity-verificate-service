/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import AppError from './AppError';
import { ResponseCode } from './ResponseCode';
import { Connection, createConnection, getConnectionManager } from 'typeorm';
/* eslint-enable */
import IdentifyVerifyEntity from '../repositories/postgres/IdentifyVerifyEntity';
import IdentifyVerifyUrlEntity from '../repositories/postgres/IdentifyVerifyUrlEntity';
import Config from './Config';
import fs = require('fs');
const Message = Config.ReadConfig('./config/message.json');

// 環境ごとにconfigファイルを読み込む
let connectOption: any = null;
connectOption = JSON.parse(fs.readFileSync('./config/ormconfig.json', 'utf-8'));

// エンティティを設定
connectOption['entities'] = [
    IdentifyVerifyEntity,
    IdentifyVerifyUrlEntity
];

/**
 * コネクションの生成
 */
export async function connectDatabase (): Promise<Connection> {
    let connection = null;
    try {
        // データベースに接続
        connection = await createConnection(connectOption);
    } catch (err) {
        if (err.name === 'AlreadyHasActiveConnectionError') {
            // すでにコネクションが張られている場合には、流用する
            connection = getConnectionManager().get('postgres');
        } else {
            // エラーが発生した場合は、アプリケーション例外に内包してスローする
            throw new AppError(
                Message.FAILED_CONNECT_TO_DATABASE, ResponseCode.INTERNAL_SERVER_ERROR, err);
        }
    }
    // 接続したコネクションを返却
    return connection;
}
