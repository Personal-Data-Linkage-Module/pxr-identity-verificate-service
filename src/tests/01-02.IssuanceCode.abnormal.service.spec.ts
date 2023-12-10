/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
import Application from '../index';
import { OperatorServer, NotificationServer, CatalogServer } from './StubServer';
import { clear, disconnect } from './testDatabase';
/* eslint-enable */

jest.mock('../repositories/EntityOperation');

// const app = new App();
const expressApp = Application.express.app;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/code';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';

// Identification Verify Serviceのユニットテスト
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        // DB接続
        await connectDatabase();
        await clear();
    });
    beforeEach(async () => {
        // DB接続
        await connectDatabase();
    });
    afterAll(async () => {
        await disconnect();
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
    });
    // 本人性確認コード発行APIのテスト（正常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('異常系: ロジックの呼び出しに失敗', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000004,
                        _ver: 1
                    },
                    wf: {
                        _value: 1000007,
                        _ver: 1
                    },
                    expireAt: '2021-04-01T00:00:00.000+0900'
                });

            // Expect status is internal error code
            expect(response.body.message).toBe('未定義のエラーが発生しました');
            expect(response.status).toBe(503);
        });
    });
});
