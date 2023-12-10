/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Application from '../index';
import { OperatorServer2, OperatorServer3, MyConditionBookManageServer, MyConditionBookManageServer03 } from './StubServer';
import { clear, disconnect, insert } from './testDatabase';
import { ResponseCode } from '../common/ResponseCode';
/* eslint-enable */
import Config from '../common/Config';
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
const Message = Config.ReadConfig('./config/message.json');

const expressApp = Application.express.app;

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/user/settings';

const cookie3: string = 'operator_type3_session';
const cookie2: string = 'operator_type2_session';
const cookie1: string = 'operator_type2_session';
const cookie0: string = 'operator_type0_session';

const session2 = JSON.stringify({
    sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
    operatorId: 1,
    type: 2,
    loginId: 'test-user',
    name: 'test-user',
    mobilePhone: '0311112222',
    auth: {
        add: true,
        update: true,
        delete: true
    },
    lastLoginAt: '2020-01-01T00:00:00.000+0900',
    attributes: {},
    roles: [
        {
            _value: 1,
            _ver: 1
        }
    ],
    block: {
        _value: 1000110,
        _ver: 1
    },
    actor: {
        _value: 1000001,
        _ver: 1
    }
});

const session4 = JSON.stringify({
    sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
    operatorId: 1,
    type: 2,
    loginId: 'test-user',
    name: 'test-user',
    mobilePhone: '0311112222',
    auth: {
        add: true,
        update: true,
        delete: true
    },
    lastLoginAt: '2020-01-01T00:00:00.000+0900',
    attributes: {},
    roles: [
        {
            _value: 1,
            _ver: 1
        }
    ],
    block: {
        _value: 1011111,
        _ver: 1
    },
    actor: {
        _value: 1000005,
        _ver: 1
    }
});

const session5 = JSON.stringify({
    sessionId: '494a44bb97aa0ef964f6a666b9019b2d20bf05aa811919833f3e0c0ae2b09b38',
    operatorId: 1,
    type: 3,
    loginId: 'test-user',
    name: 'test-user',
    mobilePhone: '0311112222',
    auth: {
        add: true,
        update: true,
        delete: true
    },
    lastLoginAt: '2020-01-01T00:00:00.000+0900',
    attributes: {},
    roles: [
        {
            _value: 1,
            _ver: 1
        }
    ],
    block: {
        _value: 1000112,
        _ver: 1
    },
    actor: {
        _value: 1000004,
        _ver: 1
    }
});

describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer2;
    let bookmngServcer: MyConditionBookManageServer;
    beforeAll(async () => {
        Application.start();

        bookmngServcer = new MyConditionBookManageServer();
        // DB接続
        await connectDatabase();
        await clear();
        await insert();
    });
    beforeEach(async () => {
        // DB接続
        await connectDatabase();
    });
    afterEach(async () => {
        // スタブを停止
        if (operatorServer) {
            operatorServer.server.close();
        }
        if (bookmngServcer) {
            bookmngServcer.server.close();
        }
    });
    afterAll(async () => {
        await disconnect();
        Application.stop();
        operatorServer.server.close();
    });
    describe('利用者情報設定API POST: ' + baseURI, () => {
        test('バリデーションチェック: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.body.message).toBe(Message.REQUEST_IS_EMPTY);
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
        });
        test('バリデーションチェック: 必須値が空(identifyCode)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(Message.REQUEST_MISS_REQUIRED);
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
        });
        test('バリデーションチェック: 必須値が空(userId)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ukO8z+Xf8vv7yxXQj2Hpo'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(Message.REQUEST_MISS_REQUIRED);
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
        });
        test('バリデーションチェック: 型が期待と異なる(identifyCode)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 1,
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_IS_NOT_STRING);
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
        });
        test('バリデーションチェック: 型が期待と異なる(userId)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ukO8z+Xf8vv7yxXQj2Hpo',
                    userId: 1
                });

            // Expect status is bad request
            expect(response.body.message).toBe(Message.REQUEST_PARAMETER_IS_NOT_STRING);
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
        });
        test('バリデーションチェック: 型が期待と異なる(userId)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'ukO8z+Xf8vv7yxXQj2Hpo',
                    userId: 'あ'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(Message.USERID_ASCII_ONLY);
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
        });
        test('異常系: 個人（Cookie）', async () => {
            operatorServer = new OperatorServer2(200, 0);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie0 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.UNAUTHORIZED);
            expect(response.body.message).toBe(Message.PERMISSION_DENIED);
        });
        test('異常系: WF職員（Cookie）', async () => {
            operatorServer = new OperatorServer2(200, 1);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie1 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.UNAUTHORIZED);
            expect(response.body.message).toBe(Message.PERMISSION_DENIED);
        });
        test('異常系: 既に本人確認済の本人性確認コード', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session5) })
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU4',
                    userId: 'a1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
            expect(response.body.message).toBe('指定された本人性確認コードは既に、確認済みになっています');
        });
        test('異常系: 申請されたアクターと異なるアクターが利用者IDを登録する', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session2) })
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    userId: 'b1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
            expect(response.body.message).toBe('申請されたアクターではありません');
        });
        test('正常：APP（Cookie）', async () => {
            operatorServer = new OperatorServer3(200, 2);
            bookmngServcer = new MyConditionBookManageServer();

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie2 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.OK);
        });
        test('正常：運営メンバー（Cookie）', async () => {
            operatorServer = new OperatorServer3(200, 3);
            bookmngServcer = new MyConditionBookManageServer();

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie3 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'f4pbmGBESMjCi0pAjp03CH6xAI6G6y4fI2LC0d53KvwIkYJQ',
                    userId: '5678'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.OK);
        });
        test('正常：運営メンバー（session）', async () => {
            bookmngServcer = new MyConditionBookManageServer();

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session4) })
                .send({
                    identifyCode: 'ZDFkY2VmZWMtOTI0Mi00OTBkLThmZWUtN2RiMmNkMmY2OGQx',
                    userId: 'a1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.OK);
        });
        test('正常：APP（session）', async () => {
            bookmngServcer = new MyConditionBookManageServer();

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session5) })
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU1',
                    userId: 'b1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.OK);
        });
        test('異常： WF', async () => {
            bookmngServcer = new MyConditionBookManageServer();

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set({ session: encodeURIComponent(session5) })
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
                    userId: 'c1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
            expect(response.body.message).toBe(Message.UNSUPPORTED_ACTOR_CATALOG_CODE);
        });
        test('異常系: ログインしていない', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
                    userId: 'c1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.UNAUTHORIZED);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常系: オペレーターサービスからのレスポンスが400', async () => {
            operatorServer = new OperatorServer2(400, 3);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie3 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
                    userId: 'c1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.UNAUTHORIZED);
            expect(response.body.message).toBe(Message.NOT_AUTHORIZED);
        });
        test('異常系: オペレーターサービスからのレスポンスが500', async () => {
            operatorServer = new OperatorServer2(500, 3);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie3 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
                    userId: 'c1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.INTERNAL_SERVER_ERROR);
            expect(response.body.message).toBe(Message.FAILED_TAKE_SESSION);
        });
        test('異常系: オペレーターサービスへの接続に失敗', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie3 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU2',
                    userId: 'c1111'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.INTERNAL_SERVER_ERROR);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_OPERATOR);
        });
        test('異常系: 有効期限切れ', async () => {
            operatorServer = new OperatorServer2(200, 3);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie3 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0',
                    userId: '5678'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
            expect(response.body.message).toBe(Message.EXPIRED);
        });
        test('異常：Book管理サービスからの応答が400', async () => {
            operatorServer = new OperatorServer3(200, 2);
            bookmngServcer = new MyConditionBookManageServer03(400);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie2 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.BAD_REQUEST);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_USER);
        });
        test('異常：Book管理サービスからの応答が500', async () => {
            operatorServer = new OperatorServer3(200, 2);
            bookmngServcer = new MyConditionBookManageServer03(500);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie2 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.SERVICE_UNAVAILABLE);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_USER);
        });
        test('異常：Book管理サービスからの応答が401', async () => {
            operatorServer = new OperatorServer3(200, 2);
            bookmngServcer = new MyConditionBookManageServer03(401);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie2 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.UNAUTHORIZED);
            expect(response.body.message).toBe(Message.FAILED_COOPERATE_USER);
        });
        test('異常：Book管理サービスへの接続に失敗', async () => {
            operatorServer = new OperatorServer3(200, 2);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie2 + '=d89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU8',
                    userId: '1234'
                });

            // Expect status is bad request
            expect(response.status).toBe(ResponseCode.SERVICE_UNAVAILABLE);
            expect(response.body.message).toBe(Message.FAILED_CONNECT_TO_BOOK_MANAGE);
        });
    });
});
