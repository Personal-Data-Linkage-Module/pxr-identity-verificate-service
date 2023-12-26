/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import Application from '../index';
import { OperatorServer } from './StubServer';
import { clear, disconnect, insert } from './testDatabase';
/* eslint-enable */
import Config from '../common/Config';
import { sprintf } from 'sprintf-js';
import { connectDatabase } from '../common/Connection';
const message = Config.ReadConfig('./config/message.json');

// const app = new App();
const expressApp = Application.express.app;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/url/confirm';
// テスト時に使用するセッション情報
const sessionName: string = 'operator_type0_session';

// Identification Verify Serviceのユニットテスト
describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer;
    beforeAll(async () => {
        Application.start();
        operatorServer = new OperatorServer();
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
    });
    /**
     * URL確認
     */
    describe('URL確認API POST: ' + baseURI, () => {
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
                    others: 'Is invalid'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_MISS_REQUIRED);
            expect(response.status).toBe(400);
        });
        test('バリデーションチェック: path 型が期待と異なる(文字列)', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .send({
                    path: {} // Expect string
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.REQUEST_PARAMETER_IS_NOT_STRING);
            expect(response.status).toBe(400);
        });
        test('異常系: 対象コードの本人性確認用URLが存在しない', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    path: 'notRecord'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(sprintf(message.NOT_EXISTS_IDENTIFY_CODE, 'notRecord'));
            expect(response.status).toBe(400);
        });
        test('異常系: 本人性確認用URLの有効期限切れ', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    path: 'x1VoM5keaOoAf2Htjxo23y4kB3GWXWOGUY1Ump26UMyducNW'
                });

            // Expect status is bad request
            expect(response.body.message).toBe(message.EXPIRED);
            expect(response.status).toBe(400);
        });
        test('正常系: 本人性確認用URL確認コードの照合', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    path: 'JnN0h1yWJlXm5QEv1qy7E6LT0x4Uymgro8M0SGnJhW6JwnLH'
                });

            // Expect status is success code
            expect(JSON.stringify(response.body)).toBe(JSON.stringify({
                result: 'success'
            }));
            expect(response.status).toBe(200);
        });
    });
});
