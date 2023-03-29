/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import Application from '../index';
import { OperatorServer } from './StubServer';
import { clear, insert } from './testDatabase';
/* eslint-enable */
import Config from '../common/Config';
import { connectDatabase } from '../common/Connection';
const message = Config.ReadConfig('./config/message.json');

const expressApp = Application.express.app;
// const expressApp = app.expressApp;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/url/issue';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type2_session';

// Identification Verify Serviceのユニットテスト
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    beforeAll(async () => {
        Application.start();

        operatorServer = new OperatorServer();
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
    });
    describe('URL発行API POST: ' + baseURI, () => {
        test('バリデーションチェック: 空のオブジェクト', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({});

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_IS_EMPTY);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 必須値が空', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_PARAMETER_IS_NOT_NUMBER);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック:urlType 型が期待と異なる(数値)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    userId: 'userId',
                    urlType: 'number'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_PARAMETER_IS_NOT_NUMBER);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック:userId 型が期待と異なる(文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    userId: {},
                    urlType: 0
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_PARAMETER_IS_NOT_STRING);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: 値が規定外(URL種別)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    urlType: 2,
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_URL_TYPE_PARAMETER_IS_INVALID);
            expect(response.status).toBe(400);
        });
        test('異常系: リクエストオペレーターには権限がない', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    urlType: 1,
                    userId: 'userId'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.PERMISSION_DENIED);
            expect(response.status).toBe(401);
        });
        test('正常系: 本人用確認URL発行', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=f35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96'])
                .send({
                    urlType: 0,
                    userId: 'userId'
                });

            // Expect status is success request
            expect(response.body.url).toContain('https://localhost:3007/personal-portal/enter-code/?identifyCode=');
            expect(response.status).toBe(200);
        });
    });
});
