/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import Application from '../index';
import { OperatorServer, NotificationServer, NotificationServer2, CatalogServer, CatalogServer2, MyConditionBookManageServer, MyConditionBookManageServer02, MyConditionBookManageServer03, MyConditionBookManageServer04, OperatorServerPostIdentifyCodeError } from './StubServer';
import { clear } from './testDatabase';
import Config from '../common/Config';
import { connectDatabase } from '../common/Connection';
/* eslint-enable */
const Message = Config.ReadConfig('./config/message.json');

jest.mock('../common/CodeGenerator');

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
    let bookmngServcer: MyConditionBookManageServer;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer();
        // DB接続
        await connectDatabase();
        await clear();
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
        bookmngServcer.server.close();
    });
    // 本人性確認コード発行APIのテスト（正常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('バリデーションチェック: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストボディが空です');
        });
        test('バリデーションチェック: 必須値が存在しない(actor)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    wf: {},
                    app: {}
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_MISS_REQUIRED);
        });
        test('バリデーションチェック: 必須値が空(actor)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    actor: {},
                    wf: {},
                    app: {} // ,
                    // expireAt: ''
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REQUEST_INVALID_CODE_OBJECT);
        });
        test('バリデーションチェック: オブジェクトのインスタンス形式が規定外', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    actor: 1,
                    app: {
                        _value: 1,
                        _ver: 1
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストされたコードオブジェクトは、不正な形式です');
        });
        test('バリデーションチェック: オブジェクトのインスタンス形式が規定外', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    actor: {
                        _value: 1,
                        _ver: 1
                    },
                    region: 1
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストされたコードオブジェクトは、不正な形式です');
        });
        test('バリデーションチェック: オブジェクトのインスタンス形式が規定外', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    actor: {
                        _value: 1,
                        _ver: 1
                    },
                    app: 1
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストされたコードオブジェクトは、不正な形式です');
        });
        test('バリデーションチェック: オブジェクトのインスタンス形式が規定外', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    actor: {
                        _value: 0,
                        _ver: 1
                    },
                    app: {
                        _value: '1', // 数値変換可能の為、ここは正常
                        _ver: 'a' // ここは数値である必要がある
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('リクエストされたコードオブジェクトは、不正な形式です');
        });
        test('異常系: セッション情報が取得できない', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    actor: {
                        _value: 0,
                        _ver: 1
                    },
                    wf: {
                        _value: 1,
                        _ver: 2
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('未ログイン状態でのリクエストはエラーです');
        });
        test('異常系: 個人オペレーター以外のリクエスト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    actor: {
                        _value: 0,
                        _ver: 1
                    },
                    wf: {
                        _value: 1,
                        _ver: 2
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(401);
            expect(response.body.message).toBe('操作権限がありません');
        });
        test('異常系: リクエストとカタログの情報に差異(プロバイダーカタログコード)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000094,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is bad code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('REGION/APPに紐づくアクターではありません');
        });
        test('異常系: actorコードのカタログなし', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000003,
                        _ver: 1
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('指定したカタログは存在しません(コード: 1000003)');
        });
        test('異常系: 紐づかないアクター(リージョンアクター)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    region: {
                        _value: 1000010,
                        _ver: 1
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('REGION/APPに紐づくアクターではありません');
        });
        test('異常系: 紐づかないアクター(アプリケーションアクター)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000004,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(400);
            expect(response.body.message).toBe('REGION/APPに紐づくアクターではありません');
        });
        // test('異常系: 紐づかないアクター(ワークフローアクター)', async () => {
        //     const response = await supertest(expressApp)
        //         .post(baseURI)
        //         .set({ accept: 'application/json', 'Content-Type': 'application/json' })
        //         .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
        //         .send({
        //             actor: {
        //                 _value: 1000006,
        //                 _ver: 1
        //             },
        //             wf: {
        //                 _value: 1000007,
        //                 _ver: 1
        //             }
        //         });

        //     // Expect status is bad request
        //     expect(response.status).toBe(400);
        //     expect(response.body.message).toBe('REGION/APPに紐づくアクターではありません');
        // });
        test('正常系: コード発行(リージョンアクター)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli'])
                .send({
                    actor: {
                        _value: 1000006,
                        _ver: 1
                    },
                    region: {
                        _value: 1000010,
                        _ver: 1
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(200);
            expect(response.body.identifyCode).toBe('ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx');
            expect(response.body.actor._value).toBe(1000006);
            expect(response.body.actor._ver).toBe(1);
            expect(response.body.region._value).toBe(1000010);
            expect(response.body.region._ver).toBe(1);
        });
        test('正常系: コード発行(アプリケーションアクター)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(200);
            expect(response.body.identifyCode).toBe('ABYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1');
            expect(response.body.actor._value).toBe(1000005);
            expect(response.body.actor._ver).toBe(1);
            expect(response.body.app._value).toBe(1000008);
            expect(response.body.app._ver).toBe(2);
        });
        test('正常系: コード発行(ワークフローアクター)', async () => {
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
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(200);
            expect(response.body.identifyCode).toBe('NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1');
            expect(response.body.actor._value).toBe(1000004);
            expect(response.body.actor._ver).toBe(1);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer03;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer03(200);
        await clear();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
        bookmngServcer.server.close();
    });
    // 本人性確認コード発行APIのテスト（正常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('正常系: コード発行(データ取引)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000020,
                        _ver: 1
                    },
                    app: null,
                    wf: null
                });

            // Expect status is success code
            expect(response.status).toBe(200);
            expect(response.body.identifyCode).toBe('NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1');
            expect(response.body.actor._value).toBe(1000020);
            expect(response.body.actor._ver).toBe(1);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer03;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer03(200);
        await clear();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
        bookmngServcer.server.close();
    });
    // 確認済本人性確認コード生成APIのテスト（正常系）
    describe('確認済本人性確認コード生成API POST: ' + baseURI, () => {
        test('正常系: コード発行(利用者ID連携中の場合、連携解除申請)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=9147a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    pxrId: 'personal_member03',
                    userId: 'test.bank',
                    actor: {
                        _value: 1000020,
                        _ver: 1
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(200);
            expect(response.body.identifyCode).toBe('NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1');
            expect(response.body.actor._value).toBe(1000020);
            expect(response.body.actor._ver).toBe(1);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer03;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer03(200);
        await clear();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
        bookmngServcer.server.close();
    });
    // 本人性確認コード発行APIのテスト（正常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('正常系: コード発行(利用者ID連携が申請中の状態で、本人性確認コードを再発行する場合)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000020,
                        _ver: 1
                    },
                    app: null,
                    wf: null
                });

            // Expect status is success code
            expect(response.status).toBe(200);
            expect(response.body.identifyCode).toBe('NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1');
            expect(response.body.actor._value).toBe(1000020);
            expect(response.body.actor._ver).toBe(1);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer03;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer03(200);
        await clear();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
        bookmngServcer.server.close();
    });
    // 確認済本人性確認コード生成APIのテスト（正常系）
    describe('確認済本人性確認コード生成API POST: ' + baseURI, () => {
        test('正常系: コード発行(利用者ID連携が連携解除申請中の状態で、本人性確認コードを再発行する場合)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=9347a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    pxrId: 'personal_member02',
                    userId: 'test.bank',
                    actor: {
                        _value: 1000020,
                        _ver: 1
                    },
                    region: {
                        _value: 1000011,
                        _ver: 1
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(200);
            expect(response.body.identifyCode).toBe('NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1');
            expect(response.body.actor._value).toBe(1000020);
            expect(response.body.actor._ver).toBe(1);
            expect(response.body.region._value).toBe(1000011);
            expect(response.body.region._ver).toBe(1);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer2;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer();
        await clear();
    });
    afterEach(async () => {
        noticeServer.server.close();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
        bookmngServcer.server.close();
    });
    // 本人性確認コード発行APIのテスト（異常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('異常系: 通知サービスからのレスポンスが200以外', async () => {
            noticeServer = new NotificationServer2(500);

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
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('連携する通知の登録処理に失敗しました');
        });
        test('異常系: 通知サービスへの接続に失敗', async () => {
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
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('通知サービスへの通知データの登録処理に失敗しました');
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer2;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        await clear();
    });
    afterEach(async () => {
        catalogServer.server.close();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
    });
    // 本人性確認コード発行APIのテスト（異常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('異常系: カタログサービスからのレスポンスが500', async () => {
            catalogServer = new CatalogServer2(500);

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
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('カタログサービスからのカタログ取得に失敗しました');
        });
        test('異常系: カタログサービスへの接続に失敗', async () => {
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
                    }
                });

            // Expect status is bad request
            expect(response.status).toBe(500);
            expect(response.body.message).toBe('カタログサービスからのカタログ取得に失敗しました');
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer02;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        await clear();
    });
    afterEach(async () => {
        bookmngServcer.server.close();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
    });
    // 本人性確認コード発行APIのテスト（正常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('異常：Book管理サービスからの応答が400', async () => {
            bookmngServcer = new MyConditionBookManageServer02(400);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_USER);
        });
        test('異常：Book管理サービスからの応答が500', async () => {
            bookmngServcer = new MyConditionBookManageServer02(500);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_USER);
        });
        test('異常：Book管理サービスからの応答が401', async () => {
            bookmngServcer = new MyConditionBookManageServer02(401);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_USER);
        });
        test('異常：Book管理サービスへの接続に失敗', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_BOOK_MANAGE);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer04;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        await clear();
    });
    afterEach(async () => {
        bookmngServcer.server.close();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        operatorServer.server.close();
        noticeServer.server.close();
        catalogServer.server.close();
    });
    // 本人性確認コード発行APIのテスト（正常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('異常：Book管理サービス.利用者ID連携申請からの応答が400', async () => {
            bookmngServcer = new MyConditionBookManageServer04(400);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_REQUEST);
        });
        test('異常：Book管理サービス.利用者ID連携申請からの応答が500', async () => {
            bookmngServcer = new MyConditionBookManageServer04(500);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_REQUEST);
        });
        test('異常：Book管理サービス.利用者ID連携申請からの応答が401', async () => {
            bookmngServcer = new MyConditionBookManageServer04(401);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(401);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_REQUEST);
        });
        test('異常：Book管理サービス.利用者ID連携申請への接続に失敗', async () => {
            bookmngServcer = new MyConditionBookManageServer04(null);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(503);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_BOOK_MANAGE);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer;
    beforeAll(async () => {
        Application.start();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer();
        await clear();
    });
    afterEach(async () => {
        operatorServer.server.close();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        noticeServer.server.close();
        catalogServer.server.close();
        bookmngServcer.server.close();
    });
    // 本人性確認コード発行APIのテスト（正常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('異常：オペレーターサービス本人性確認コード登録からの応答が400', async () => {
            operatorServer = new OperatorServerPostIdentifyCodeError(400);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_POST_IDENTIFY_CODE);
        });
        test('異常：オペレーターサービス本人性確認コード登録への接続に失敗', async () => {
            operatorServer = new OperatorServerPostIdentifyCodeError(null);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    app: {
                        _value: 1000008,
                        _ver: 2
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(500);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
    });
});
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    let noticeServer: NotificationServer;
    let catalogServer: CatalogServer;
    let bookmngServcer: MyConditionBookManageServer;
    beforeAll(async () => {
        Application.start();
        noticeServer = new NotificationServer();
        catalogServer = new CatalogServer();
        bookmngServcer = new MyConditionBookManageServer();
        await clear();
    });
    afterEach(async () => {
        operatorServer.server.close();
    });
    afterAll(async () => {
        // アプリケーションの停止
        Application.stop();
        noticeServer.server.close();
        catalogServer.server.close();
        bookmngServcer.server.close();
    });
    // 本人性確認コード発行APIのテスト（異常系）
    describe('本人性確認コード発行API POST: ' + baseURI, () => {
        test('異常：開始前Regionの指定', async () => {
            operatorServer = new OperatorServerPostIdentifyCodeError(null);
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli'])
                .send({
                    actor: {
                        _value: 1000005,
                        _ver: 1
                    },
                    region: {
                        _value: 1000009,
                        _ver: 1
                    }
                });

            // Expect status is success code
            expect(response.status).toBe(400);
            expect(response.body.message).toBe(Message.REGION_NOT_OPEN);
        });
    });
});
