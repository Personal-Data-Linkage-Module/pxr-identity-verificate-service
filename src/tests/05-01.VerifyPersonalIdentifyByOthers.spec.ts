/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
import Application from '../index';
import { OperatorServer, NotificationServer, CatalogServer, MyConditionBookManageServer } from './StubServer';
import { clear, disconnect, insert } from './testDatabase';
/* eslint-enable */

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
        await insert();
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
        test('バリデーションチェック: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストボディが空です');
        });
        test('バリデーションチェック: 必須値が空', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({ others: 0 });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエスト内容に必須値が存在しません');
        });
        test('バリデーションチェック: 型が期待と異なる(数値)', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({ status: 'string' });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('数値を期待するパラメーターが数値ではありません');
        });
        test('バリデーションチェック: 値が規定外', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({ status: 0 });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('ステータスパラメーターが規定とする値ではありません(規定値: 1, 2)');
        });
        test('異常系: 権限がないユーザー種別からの操作', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'a')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({ status: 1 });

            // Expect status is un authorized
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('操作権限がありません');
        });
        test('異常系: 本人性確認コードの有効期限切れ', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({ status: 1 });

            // Expect status is success code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('指定された本人性確認コードは、有効期限切れです');
        });
        test('異常系: 利用者IDが設定されていない', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW10')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2'])
                .send({ status: 1 });

            // Expect status is success code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('利用者IDを設定してください');
        });
        test('異常系: 申請アクター以外での承認', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW11')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({ status: 1 });

            // Expect status is success code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('申請されたアクターではありません');
        });
        test('正常系: 確認結果の登録', async () => {
            const response = await supertest(expressApp)
                .put(baseURI + 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW11')
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2'])
                .send({ status: 1 });

            // Expect status is success code
            expect(response.status).toBe(200);
        });
    });
});
