/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
import Application from '../index';
import { OperatorServer } from './StubServer';
import { clear, insert } from './testDatabase';
/* eslint-enable */

jest.mock('../repositories/EntityOperation');

// const app = new App();
const expressApp = Application.express.app;
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
    });
    describe('URL発行API POST: ' + baseURI, () => {
        test('異常系: ロジックの呼び出しに失敗', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=f35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96'])
                .send({
                    urlType: 0
                });

            // Expect status is internal error code
            expect(response.body.message).toBe('未定義のエラーが発生しました');
            expect(response.status).toBe(503);
        });
    });
});
