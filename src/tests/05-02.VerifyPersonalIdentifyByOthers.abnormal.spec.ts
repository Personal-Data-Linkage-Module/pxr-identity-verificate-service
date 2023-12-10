/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
import Application from '../index';
import { OperatorServer, NotificationServer, CatalogServer, MyConditionBookManageServer } from './StubServer';
import { clear, disconnect } from './testDatabase';
/* eslint-enable */

jest.mock('../repositories/EntityOperation');

// const app = new App();
const expressApp = Application.express.app;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/verify/others/';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';

// Identification Verify Serviceのユニットテスト
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let myConditionBookManageServer: MyConditionBookManageServer;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        myConditionBookManageServer = new MyConditionBookManageServer();
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
        myConditionBookManageServer.server.close();
    });
    describe('第三者による本人性確認API PUT: ' + baseURI, () => {
        test('異常系: ロジックの呼び出しに失敗', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({ status: 1 });

            // Expect status is success code
            expect(response.body.message).toBe('未定義のエラーが発生しました');
            expect(response.status).toBe(503);
        });
    });
});
