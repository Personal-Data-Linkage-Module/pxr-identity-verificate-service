/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Application from '../index';
import { OperatorServer2 } from './StubServer';
import { clear, disconnect, insert } from './testDatabase';
import { ResponseCode } from '../common/ResponseCode';
/* eslint-enable */
import Config from '../common/Config';
import * as supertest from 'supertest';
import { connectDatabase } from '../common/Connection';
const Message = Config.ReadConfig('./config/message.json');

jest.mock('../repositories/EntityOperation');

const expressApp = Application.express.app;

// Unit対象のURL（ベース）
const baseURI = '/identity-verificate/user/settings';

const cookie3: string = 'operator_type3_session';

describe('Identification Verify Service', () => {
    let operatorServer: OperatorServer2;
    beforeAll(async () => {
        Application.start();

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
        Application.stop();
        operatorServer.server.close();
    });
    describe('利用者情報設定API POST: ' + baseURI, () => {
        test('異常系: ロジックの呼び出しに失敗', async () => {
            operatorServer = new OperatorServer2(200, 3);

            const response = await supertest(expressApp)
                .post(baseURI)
                .set({ accept: 'application/json', 'Content-Type': 'application/json' })
                .set('Cookie', [cookie3 + '=b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4'])
                .send({
                    identifyCode: 'NWYzNDQyODItY2VkNC00YmJhLWIxNDQtNmRhZGZlMDg4NWU0',
                    userId: '5678'
                });

            // Expect status is internal error code
            expect(response.body.message).toBe(Message.UNDEFINED_ERROR);
            expect(response.status).toBe(ResponseCode.SERVICE_UNAVAILABLE);
        });
    });
});
