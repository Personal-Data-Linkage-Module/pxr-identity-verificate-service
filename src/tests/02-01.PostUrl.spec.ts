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

const expressApp = Application.express.app;
// const expressApp = app.expressApp;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/url';
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
    describe('URL発行API POST: ' + baseURI, () => {
        test('バリデーションチェック: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.body.message).toBe('リクエストボディが空です');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 必須値が空', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    urlType: 'number'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('リクエスト内容に必須値が存在しません');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 型が期待と異なる(数値)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    urlType: 'number'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('数値を期待するパラメーターが数値ではありません');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 型が期待と異なる(文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    urlType: 2,
                    userId: 1
                });

            // Expect status is bad request
            expect(response.body.message).toBe('文字列を期待するパラメーターが文字列ではありません');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 型が期待と異なる(全角文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    urlType: 0,
                    userId: 'あ'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('利用者IDは半角英数記号で設定してください');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 値が規定外(URL種別)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    urlType: 2,
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('発行するURL種別のパラメーターが規定とする値ではありません(規定値: 0, 1)');
            expect(response.status).toBe(400);
        });
        test('異常系: リクエストオペレーターには権限がない', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    urlType: 1,
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('操作権限がありません');
            expect(response.status).toBe(401);
        });
        test('異常系: 有効期限が切れている', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0',
                    urlType: 1,
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('指定された本人性確認コードは、有効期限切れです');
            expect(response.status).toBe(400);
        });
        test('異常系: 既に本人確認済の本人性確認コード', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU4',
                    urlType: 1,
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('指定された本人性確認コードは既に、確認済みになっています');
            expect(response.status).toBe(400);
        });
        test('異常系: 申請されたアクターと異なるアクターが利用者IDを登録する', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    urlType: 1,
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('申請されたアクターではありません');
            expect(response.status).toBe(400);
        });
        test('正常系: 本人用確認URL発行', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    urlType: 0,
                    userId: 'userId'
                });

            // Expect status is success request
            expect(JSON.stringify(response.body)).toBe(
                JSON.stringify({
                    url: 'https://localhost:3007/personal-portal/enter-code/?identifyCode=ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx'
                }));
            expect(response.status).toBe(200);
        });
        test('正常系: 第三者用確認URL発行', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1',
                    urlType: 1,
                    userId: 'userId01'
                });

            // Expect status is success request
            expect(JSON.stringify(response.body)).toBe(
                JSON.stringify({
                    url: 'https://localhost:3007/personal-portal/enter-code/?identifyCode=NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1'
                }));
            expect(response.status).toBe(200);
        });
        test('異常系: 第三者用確認URL発行に失敗（WFに紐づく利用者ID）', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
                    urlType: 1,
                    userId: 'userId01'
                });

            // Expect status is success request
            expect(response.body.message).toBe('アクターのカタログコードがサポート外です');
            expect(response.status).toBe(400);
        });
        test('正常系: リージョン利用者URL発行', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    identifyCode: 'Nkhcx7lDk4GyKhAabiiagL6Oi3dqssO0YwdHMRCSNpLUh0J3',
                    urlType: 0,
                    userId: 'userId01'
                });

            // Expect status is success request
            expect(JSON.stringify(response.body)).toBe(
                JSON.stringify({
                    url: 'https://localhost:3007/personal-portal/enter-code/?identifyCode=Nkhcx7lDk4GyKhAabiiagL6Oi3dqssO0YwdHMRCSNpLUh0J3'
                }));
            expect(response.status).toBe(200);
        });
    });
});
