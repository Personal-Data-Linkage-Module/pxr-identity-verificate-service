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
const baseURI = '/identity-verificate/collate';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';

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
    describe('本人性確認コード照合API POST: ' + baseURI, () => {
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
                    others: 'Is invalid'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('リクエスト内容に必須値が存在しません');
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 型が期待と異なる(文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: {} // Expect string
                });

            // Expect status is bad request
            expect(response.body.message).toBe('文字列を期待するパラメーターが文字列ではありません');
            expect(response.status).toBe(400);
        });
        test('異常系: 権限がないユーザー種別からの操作', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=gursgim2xlmq7o160nhhr50otrkrtqnrh0n6ij8epn3foewbnhcox6ek8axcl1xj'])
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx'
                });

            // Expect status is un authorized
            expect(response.body.message).toBe('操作権限がありません');
            expect(response.status).toBe(401);
        });
        test('異常系: 本人性確認コードの有効期限切れ', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('指定された本人性確認コードは、有効期限切れです');
            expect(response.status).toBe(400);
        });
        test('異常系: 本人性確認が未だ済んでいないコード', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NW16'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('指定された本人性確認コードは、確認済み(成功)ではありません');
            expect(response.status).toBe(400);
        });
        test('正常系: アプリケーションカタログに関連した本人性確認コードの照合', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU7'
                });

            // Expect status is success code
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'personal_member02',
                userId: '',
                actor: { _value: '1000005', _ver: '1' },
                app: { _value: '1000008', _ver: '1' }
            }));
            expect(response.status).toBe(200);
        });
        test('異常系: ワークフローカタログに関連した本人性確認コードの照合', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'epI8tHnrNbSwpQmcEtDIfWvewNmeIAbgscmOf0y1eMux7s2s'
                });

            // Expect status is success code
            /* ワークフローカタログの情報は返らない（未実装） */
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                pxrId: 'personal_member01',
                userId: '',
                actor: { _value: '1000004', _ver: '1' }
            }));
            expect(response.status).toBe(200);
        });
    });
    describe('本人性確認コード照合（個人）API POST:' + baseURI, () => {
        test('バリデーションチェック: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_IS_EMPTY);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: path 型が期待と異なる(文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    path: {} // Expect string
                });

            // Expect status is bad request
            expect(response.body.reasons[0].message).toBe(message.validation.isString);
            expect(response.body.reasons[0].property).toBe('path');
            expect(response.status).toBe(400);
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
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
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
