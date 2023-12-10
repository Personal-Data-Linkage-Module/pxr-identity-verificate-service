/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import Application from '../index';
import { OperatorServer, NotificationServer, CatalogServer, MyConditionBookManageServerIndCollation } from './StubServer';
import { clear, disconnect, insert } from './testDatabase';
/* eslint-enable */
import Config from '../common/Config';
import { connectDatabase } from '../common/Connection';
const message = Config.ReadConfig('./config/message.json');

// const app = new App();
const expressApp = Application.express.app;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/ind/collate';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type0_session';

// Identification Verify Serviceのユニットテスト
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookManageServer: MyConditionBookManageServerIndCollation;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookManageServer = new MyConditionBookManageServerIndCollation();
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
        bookManageServer.server.close();
    });
    /**
     * 個人による本人性確認コード照合（非推奨）
     */
    describe('個人による本人性確認コード照合API POST（非推奨）: ' + baseURI, () => {
        test('バリデーションチェック: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_IS_EMPTY);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: リクエストが配列', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send([{
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    path: 'HKi3XUQCKtTOVFvNCkYdCJLy64vkwnj626qcx4E4rDiVDwyh'
                }]);

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_IS_ARRAY);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 必須値が空', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    others: 'Is invalid'
                });

            // Expect status is bad request
            expect(response.body.reasons[0].message).toBe(message.validation.isDefined);
            expect(response.body.reasons[0].property).toBe('identifyCode');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: identifyCode 型が期待と異なる(文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: {}, // Expect string
                    path: 'HKi3XUQCKtTOVFvNCkYdCJLy64vkwnj626qcx4E4rDiVDwyh'
                });

            // Expect status is bad request
            expect(response.body.reasons[0].message).toBe(message.validation.isString);
            expect(response.body.reasons[0].property).toBe('identifyCode');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: path 型が期待と異なる(文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    path: {} // Expect string
                });

            // Expect status is bad request
            expect(response.body.reasons[0].message).toBe(message.validation.isString);
            expect(response.body.reasons[0].property).toBe('path');
            expect(response.status).toBe(400);
        });
        test('異常系: 権限がないユーザー種別からの操作（運営）', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899'])
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    path: 'HKi3XUQCKtTOVFvNCkYdCJLy64vkwnj626qcx4E4rDiVDwyh'
                });

            // Expect status is un authorized
            expect(response.body.message).toBe(message.PERMISSION_DENIED);
            expect(response.status).toBe(401);
        });
        test('異常系: 本人性確認コードの有効期限切れ', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0',
                    path: 'HKi3XUQCKtTOVFvNCkYdCJLy64vkwnj626qcx4E4rDiVDwyh'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.EXPIRED);
            expect(response.status).toBe(400);
        });
        test('異常系: 本人性確認用URLの有効期限切れ', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    path: 'x1VoM5keaOoAf2Htjxo23y4kB3GWXWOGUY1Ump26UMyducNW'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.EXPIRED);
            expect(response.status).toBe(400);
        });
        test('異常系: オペレーターのpxrIdと値が異なるコード', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU7',
                    path: 'HKi3XUQCKtTOVFvNCkYdCJLy64vkwnj626qcx4E4rDiVDwyh'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.NOT_MATCH_PXR_ID);
            expect(response.status).toBe(400);
        });
        test('正常系: リージョンカタログに関連した本人性確認コードの照合', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli'])
                .send({
                    identifyCode: 'Nkhcx7lDk4GyKhAabiiagL6Oi3dqssO0YwdHMRCSNpLUh0J3',
                    path: 'JnN0h1yWJlXm5QEv1qy7E6LT0x4Uymgro8M0SGnJhW6JwnLH'
                });

            // Expect status is success code
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'personal_member06',
                userId: 'test_user',
                actor: { _value: '1000005', _ver: '1' },
                region: { _value: '1000008', _ver: '1' }
            }));
            expect(response.status).toBe(200);
        });
        test('正常系: アプリケーションカタログに関連した本人性確認コードの照合', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU7',
                    path: 'VQ5Xq0jLOjnjTSA1gEfBGqEglEmyiGyEij6JoUheERVEgMtX'
                });

            // Expect status is success code
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'personal_member02',
                userId: 'test_user',
                actor: { _value: '1000005', _ver: '1' },
                app: { _value: '1000008', _ver: '1' }
            }));
            expect(response.status).toBe(200);
        });
        test('異常系: ワークフローカタログに関連した本人性確認コードの照合', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW10',
                    path: 'HKi3XUQCKtTOVFvNCkYdCJLy64vkwnj626qcx4E4rDiVDwyh'
                });

            // Expect status is success code
            expect(response.body.message).toBe(message.UNSUPPORTED_ACTOR_CATALOG_CODE);
            expect(response.status).toBe(400);
        });
        test('正常系: pathなし', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU7'
                });

            // Expect status is success code
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'personal_member02',
                userId: 'test_user',
                actor: { _value: '1000005', _ver: '1' },
                app: { _value: '1000008', _ver: '1' }
            }));
            expect(response.status).toBe(200);
        });
    });
});
