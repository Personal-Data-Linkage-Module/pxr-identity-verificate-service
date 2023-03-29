/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
import Application from '../index';
import { OperatorServer, NotificationServer, CatalogServer, MyConditionBookManageServer } from './StubServer';
import { clear, insert } from './testDatabase';
/* eslint-enable */

// const app = new App();
const expressApp = Application.express.app;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/acquisition/identification/';
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
        await insert();
    });
    beforeEach(async () => {
        // DB接続
        await connectDatabase();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
        myConditionBookManageServer.server.close();
    });
    describe('本人性確認事項の取得API　GET: ' + baseURI, () => {
        test('異常系: 取得権限がない', async () => {
            const response = await supertest(expressApp)
                .get(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU4')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5']);

            // Expect status is un authorized
            expect(response.body.message).toBe('操作権限がありません');
            expect(response.status).toBe(401);
        });
        test('異常系: 本人性確認コードの有効期限切れ', async () => {
            const response = await supertest(expressApp)
                .get(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4']);

            // Expect status is bad request
            expect(response.body.message).toBe('指定された本人性確認コードは、有効期限切れです');
            expect(response.status).toBe(400);
        });
        test('異常系: 本人性確認がすでに済んでいるコード', async () => {
            const response = await supertest(expressApp)
                .get(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU4')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4']);

            // Expect status is bad request
            expect(response.body.message).toBe('指定された本人性確認コードは既に、確認済みになっています');
            expect(response.status).toBe(400);
        });
        test('異常系: PXR-IDから本人性確認事項の取得に失敗', async () => {
            const response = await supertest(expressApp)
                .get(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2']);

            // Expect status is internal error code
            expect(response.body.message).toBe('My-Condition-Book管理サービスから本人性確認事項の取得に失敗しました');
            expect(response.status).toBe(500);
        });
        test('異常系: 申請アクター以外での本人性確認事項の取得', async () => {
            const response = await supertest(expressApp)
                .get(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW10')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4']);

            // Expect status is success code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('申請されたアクターではありません');
        });
        test('正常系: 本人性確認事項の取得', async () => {
            const response = await supertest(expressApp)
                .get(baseURI + 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OG12')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899']);

            // Expect status is success code
            expect(response.status).toBe(200);
        });
        test('正常系: 本人性確認事項の取得', async () => {
            const response = await supertest(expressApp)
                .get(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW11')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2']);

            // Expect status is success code
            expect(response.status).toBe(200);
        });
    });
});
