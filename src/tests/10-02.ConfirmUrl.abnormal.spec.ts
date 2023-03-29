/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
import Application from '../index';
import { OperatorServer, NotificationServer, CatalogServer } from './StubServer';
import { clear, insert } from './testDatabase';
/* eslint-enable */

jest.mock('../repositories/EntityOperation');

// const app = new App();
const expressApp = Application.express.app;
// app.listen(3007);

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/url/confirm';
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
    /**
     * 個人による本人性確認コード照合
     */
    describe('個人による本人性確認コード照合API POST: ' + baseURI, () => {
        test('異常系: ロジックの呼び出しに失敗', async () => {
            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [sessionName + '=8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5'])
                .send({
                    path: 'HKi3XUQCKtTOVFvNCkYdCJLy64vkwnj626qcx4E4rDiVDwyh'
                });

            // Expect status is bad request
            expect(response.body.message).toBe('未定義のエラーが発生しました');
            expect(response.status).toBe(503);
        });
    });
});
