/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import * as express from 'express';
import Config from './Config';
import { Server } from 'net';
/* eslint-enable */

const session8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5 =
    Config.ReadConfig('./src/tests/Operator/session/8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5.json');
const session9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5 =
    Config.ReadConfig('./src/tests/Operator/session/9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5.json');
const session9147a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5 =
    Config.ReadConfig('./src/tests/Operator/session/9147a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5.json');
const session9247a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5 =
    Config.ReadConfig('./src/tests/Operator/session/9247a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5.json');
const session9347a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5 =
    Config.ReadConfig('./src/tests/Operator/session/9347a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5.json');
const sessionb01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4 =
    Config.ReadConfig('./src/tests/Operator/session/b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4.json');
const sessionfd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2 =
    Config.ReadConfig('./src/tests/Operator/session/fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2.json');
const session5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899 =
    Config.ReadConfig('./src/tests/Operator/session/5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899.json');
const sessionf35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96 =
    Config.ReadConfig('./src/tests/Operator/session/f35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96.json');
const session82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli =
    Config.ReadConfig('./src/tests/Operator/session/82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli.json');
const sessiongursgim2xlmq7o160nhhr50otrkrtqnrh0n6ij8epn3foewbnhcox6ek8axcl1xj =
    Config.ReadConfig('./src/tests/Operator/session/gursgim2xlmq7o160nhhr50otrkrtqnrh0n6ij8epn3foewbnhcox6ek8axcl1xj.json');

const catalog1000004 = Config.ReadConfig('./src/tests/Catalog/1000004.json');
const catalog1000007 = Config.ReadConfig('./src/tests/Catalog/1000007.json');
const catalog1000005 = Config.ReadConfig('./src/tests/Catalog/1000005.json');
const catalog1000006 = Config.ReadConfig('./src/tests/Catalog/1000006.json');
const catalog1000008 = Config.ReadConfig('./src/tests/Catalog/1000008.json');
const catalog1000009 = Config.ReadConfig('./src/tests/Catalog/1000009.json');
const catalog1000010 = Config.ReadConfig('./src/tests/Catalog/1000010.json');
const catalog1000011 = Config.ReadConfig('./src/tests/Catalog/1000011.json');
const catalog1000111 = Config.ReadConfig('./src/tests/Catalog/1000111.json');
const catalog1000112 = Config.ReadConfig('./src/tests/Catalog/1000112.json');
const catalog1000020 = Config.ReadConfig('./src/tests/Catalog/1000020.json');

const identification = Config.ReadConfig('./src/tests/Book/personal_member01.json');

export class OperatorServer {
    app: express.Express;
    server: Server;
    constructor () {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            if (req.body.sessionId === '8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9147a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9147a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9247a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9247a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9347a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9347a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli') {
                res.status(200).json(session82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli).end();
            } else if (req.body.sessionId === 'b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4') {
                res.status(200).json(sessionb01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4).end();
            } else if (req.body.sessionId === 'fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2') {
                res.status(200).json(sessionfd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2).end();
            } else if (req.body.sessionId === '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899') {
                res.status(200).json(session5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899).end();
            } else if (req.body.sessionId === 'f35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96') {
                res.status(200).json(sessionf35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96).end();
            } else if (req.body.sessionId === 'gursgim2xlmq7o160nhhr50otrkrtqnrh0n6ij8epn3foewbnhcox6ek8axcl1xj') {
                res.status(200).json(sessiongursgim2xlmq7o160nhhr50otrkrtqnrh0n6ij8epn3foewbnhcox6ek8axcl1xj).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.post('/operator/identifyCode', (req: express.Request, res: express.Response) => {
            res.status(200).end();
        });
        this.server = this.app.listen(3000);
    }
}

export class OperatorServer2 {
    app: express.Express;
    server: Server;
    constructor (status: number, type: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            res.status(status);
            res.json({
                sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
                operatorId: 2,
                type: type,
                loginId: '58di2dfse2.test.org',
                pxrId: '58di2dfse2.test.org',
                mobilePhone: '09011112222',
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                block: {
                    _value: 1000110,
                    _ver: 1
                },
                actor: {
                    _value: 1000001,
                    _ver: 1
                }
            });
        });
        this.server = this.app.listen(3000);
    }
}

export class OperatorServer3 {
    app: express.Express;
    server: Server;
    constructor (status: number, type: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            res.status(status);
            res.json({
                sessionId: 'd89171efae04aa55357bdd2ebf8338725c8fd17ffdfbe61be66ca96c7590b296',
                operatorId: 2,
                type: type,
                loginId: '58di2dfse2.test.org',
                pxrId: '58di2dfse2.test.org',
                mobilePhone: '09011112222',
                lastLoginAt: '2020-01-01T00:00:00.000+0900',
                attributes: {},
                block: {
                    _value: 1000112,
                    _ver: 1
                },
                actor: {
                    _value: 1000004,
                    _ver: 1
                }
            });
        });
        this.server = this.app.listen(3000);
    }
}

export class OperatorServerPostIdentifyCodeError {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/operator/session', (req: express.Request, res: express.Response) => {
            if (req.body.sessionId === '8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session8947a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9047a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9147a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9147a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9247a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9247a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '9347a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5') {
                res.status(200).json(session9347a6a73a6c8f952fe73678d84c2684892921bbdbd3a10fe910a7a8d3bb5aa5).end();
            } else if (req.body.sessionId === '82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli') {
                res.status(200).json(session82572dtpd1eylx1hv4jpbdn0t0myi8sdp2w6jww7pg1q6m5nxnwca03t7t57qnli).end();
            } else if (req.body.sessionId === 'b01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4') {
                res.status(200).json(sessionb01a8039312111585b61ffe5ae202a7b50450e5eca6f40f73ad9837a6b7afcd4).end();
            } else if (req.body.sessionId === 'fd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2') {
                res.status(200).json(sessionfd6794e65edcf2198819fe44298191f32c71719bf03bfedec0b15a7833624fb2).end();
            } else if (req.body.sessionId === '5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899') {
                res.status(200).json(session5b4fcfb619a4fd3215e3582412eecfd5ab7e06eb112c52402805a730e8737899).end();
            } else if (req.body.sessionId === 'f35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96') {
                res.status(200).json(sessionf35e1f615f887425bf27e47b8014568d8d73047699757b7d824e50d5b0092b96).end();
            } else {
                res.status(204).end();
            }
            if (!status) {
                this.server.close();
            }
        });
        this.app.post('/operator/identifyCode', (req: express.Request, res: express.Response) => {
            res.status(status).end();
        });
        this.server = this.app.listen(3000);
    }
}
export class NotificationServer {
    app: express.Express;
    server: Server;
    constructor () {
        this.app = express();
        this.app.post('/notification', (req: express.Request, res: express.Response) => {
            res.status(200).end();
        });
        this.server = this.app.listen(3004);
    }
}

export class NotificationServer2 {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.post('/notification', (req: express.Request, res: express.Response) => {
            res.status(status).end();
        });
        this.server = this.app.listen(3004);
    }
}

export class CatalogServer {
    app: express.Express;
    server: Server;
    constructor () {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.get('/catalog/name', (req: express.Request, res: express.Response) => {
            res.status(200).json({
                ext_name: 'test-org'
            });
        });
        this.app.get('/catalog/:code', (req: express.Request, res: express.Response) => {
            if (req.params.code + '' === 1000004 + '') {
                res.status(200).json(catalog1000004).end();
            } else if (req.params.code + '' === 1000005 + '') {
                res.status(200).json(catalog1000005).end();
            } else if (req.params.code + '' === 1000006 + '') {
                res.status(200).json(catalog1000006).end();
            } else if (req.params.code + '' === 1000007 + '') {
                res.status(200).json(catalog1000007).end();
            } else if (req.params.code + '' === 1000008 + '') {
                res.status(200).json(catalog1000008).end();
            } else if (req.params.code + '' === 1000009 + '') {
                res.status(200).json(catalog1000009).end();
            } else if (req.params.code + '' === 1000010 + '') {
                res.status(200).json(catalog1000010).end();
            } else if (req.params.code + '' === 1000011 + '') {
                res.status(200).json(catalog1000011).end();
            } else if (req.params.code + '' === 1000111 + '') {
                res.status(200).json(catalog1000111).end();
            } else if (req.params.code + '' === 1000112 + '') {
                res.status(200).json(catalog1000112).end();
            } else if (req.params.code + '' === 1000020 + '') {
                res.status(200).json(catalog1000020).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.get('/catalog', (req: express.Request, res: express.Response) => {
            if (typeof req.query.ns !== 'string') {
                res.status(500).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/actor/app') {
                res.status(200).json([catalog1000005]).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/actor/wf') {
                res.status(200).json([catalog1000004]).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/setting/global') {
                res.status(200).json([catalog1000004]).end();
            } else {
                res.status(204).end();
            }
        });
        this.server = this.app.listen(3001);
    }
}

export class CatalogServer2 {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.get('/catalog/:code', (req: express.Request, res: express.Response) => {
            res.status(status).end();
        });
        this.server = this.app.listen(3001);
    }
}

export class CatalogServer3 {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.get('/catalog/name', (req: express.Request, res: express.Response) => {
            res.status(200).json({
                ext_name: 'test-org'
            });
        });
        this.app.get('/catalog/:code', (req: express.Request, res: express.Response) => {
            if (req.params.code + '' === 1000004 + '') {
                res.status(200).json(catalog1000004).end();
            } else if (req.params.code + '' === 1000005 + '') {
                res.status(200).json(catalog1000005).end();
            } else if (req.params.code + '' === 1000007 + '') {
                res.status(200).json(catalog1000007).end();
            } else if (req.params.code + '' === 1000008 + '') {
                res.status(200).json(catalog1000008).end();
            } else if (req.params.code + '' === 1000009 + '') {
                res.status(200).json(catalog1000009).end();
            } else if (req.params.code + '' === 1000010 + '') {
                res.status(200).json(catalog1000010).end();
            } else if (req.params.code + '' === 1000011 + '') {
                res.status(200).json(catalog1000011).end();
            } else if (req.params.code + '' === 1000111 + '') {
                res.status(200).json(catalog1000111).end();
            } else if (req.params.code + '' === 1000112 + '') {
                res.status(200).json(catalog1000112).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.get('/catalog', (req: express.Request, res: express.Response) => {
            if (typeof req.query.ns !== 'string') {
                res.status(500).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/actor/app') {
                res.status(status).json([catalog1000005]).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/actor/wf') {
                res.status(status).json([catalog1000004]).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/setting/global') {
                if (status > 500) {
                    throw new Error();
                } else {
                    res.status(status).json([catalog1000004]).end();
                }
            } else {
                res.status(204).end();
            }
        });
        this.server = this.app.listen(3001);
    }
}

export class CatalogServerGetNameError {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.get('/catalog/name', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({
                    ext_name: 'test-org'
                });
            } else {
                res.status(status).end();
            }
        });
        this.app.get('/catalog/:code', (req: express.Request, res: express.Response) => {
            if (req.params.code + '' === 1000004 + '') {
                res.status(200).json(catalog1000004).end();
            } else if (req.params.code + '' === 1000005 + '') {
                res.status(200).json(catalog1000005).end();
            } else if (req.params.code + '' === 1000006 + '') {
                res.status(200).json(catalog1000006).end();
            } else if (req.params.code + '' === 1000007 + '') {
                res.status(200).json(catalog1000007).end();
            } else if (req.params.code + '' === 1000008 + '') {
                res.status(200).json(catalog1000008).end();
            } else if (req.params.code + '' === 1000009 + '') {
                res.status(200).json(catalog1000009).end();
            } else if (req.params.code + '' === 1000010 + '') {
                res.status(200).json(catalog1000010).end();
            } else if (req.params.code + '' === 1000011 + '') {
                res.status(200).json(catalog1000011).end();
            } else if (req.params.code + '' === 1000111 + '') {
                res.status(200).json(catalog1000111).end();
            } else if (req.params.code + '' === 1000112 + '') {
                res.status(200).json(catalog1000112).end();
            } else if (req.params.code + '' === 1000020 + '') {
                res.status(200).json(catalog1000020).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.get('/catalog', (req: express.Request, res: express.Response) => {
            if (typeof req.query.ns !== 'string') {
                res.status(500).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/actor/app') {
                res.status(200).json([catalog1000005]).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/actor/wf') {
                res.status(200).json([catalog1000004]).end();
            } else if (decodeURIComponent(req.query.ns) === 'catalog/ext/test-org/setting/global') {
                res.status(200).json([catalog1000004]).end();
            } else {
                res.status(204).end();
            }
        });
        this.server = this.app.listen(3001);
    }
}
export class MyConditionBookManageServer {
    app: express.Express;
    server: Server;
    constructor () {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/book-manage/identity', (req: express.Request, res: express.Response) => {
            if (req.body.pxrId === 'personal_member01') {
                res.status(200).json(identification).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.post('/book-manage/cooperate/request', (req: express.Request, res: express.Response) => {
            if (req.body.pxrId === 'test.org') {
                res.status(200).json({
                    pxrId: '58di2dfse2.test.org',
                    userId: '123456',
                    actor: {
                        _value: 1000003,
                        _ver: 1
                    },
                    wf: {
                        _value: 1000004,
                        _ver: 1
                    },
                    status: 0
                }).end();
            } else if (!req.body.pxrId) {
                res.status(200).json({
                    pxrId: '58di2dfse2.test.org',
                    userId: '123456',
                    actor: {
                        _value: 1000003,
                        _ver: 1
                    },
                    wf: {
                        _value: 1000004,
                        _ver: 1
                    },
                    status: 0
                }).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.post('/book-manage/cooperate/request/release', (req: express.Request, res: express.Response) => {
            res.status(200).json({
                result: 'test'
            }).end();
        });
        this.app.post('/book-manage/cooperate/user', (req: express.Request, res: express.Response) => {
            res.status(200).json({
                result: 'test'
            }).end();
        });
        this.app.post('/book-manage/search', (req: express.Request, res: express.Response) => {
            if (req.body.pxrId[0] === 'personal_member01') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                actor: {
                                    _value: 1000005,
                                    _ver: 1
                                },
                                app: {
                                    _value: 1000008,
                                    _ver: 2
                                }
                            }
                        ],
                        userInformation: {}
                    },
                    {
                        id: 2,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                actor: {
                                    _value: 1000004,
                                    _ver: 1
                                },
                                wf: {
                                    _value: 1000007,
                                    _ver: 1
                                }
                            }
                        ],
                        userInformation: {
                            'item-group': [
                                {
                                    item: null
                                },
                                {
                                    item: [
                                        {
                                            type: {
                                                _value: 30001
                                            },
                                            content: '名前'
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        id: 3,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: {
                            'item-group': [
                                {
                                    item: [
                                        {
                                            type: {
                                                _value: 30001
                                            },
                                            content: '名前'
                                        },
                                        {
                                            type: {
                                                _value: 30036
                                            },
                                            content: '10234567890'
                                        }
                                    ]
                                }
                            ]
                        }
                    },
                    {
                        id: 4,
                        pxrId: 'test',
                        status: 0,
                        cooperation: null,
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'test.org') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                actor: {
                                    _value: 1000005,
                                    _ver: 1
                                },
                                app: {
                                    _value: 1000008,
                                    _ver: 2
                                }
                            }
                        ],
                        userInformation: null
                    },
                    {
                        id: 2,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                actor: {
                                    _value: 1000004,
                                    _ver: 1
                                },
                                wf: {
                                    _value: 1000007,
                                    _ver: 1
                                }
                            }
                        ],
                        userInformation: null
                    },
                    {
                        id: 3,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    },
                    {
                        id: 4,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 1,
                                actor: {
                                    _value: 1000006,
                                    _ver: 1
                                },
                                region: {
                                    _value: 1000009,
                                    _ver: 1
                                },
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    },
                    {
                        id: 5,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 1,
                                actor: {
                                    _value: 1000005,
                                    _ver: 1
                                },
                                region: null,
                                app: {
                                    _value: 1000008,
                                    _ver: 2
                                },
                                wf: null
                            }
                        ],
                        userInformation: null
                    },
                    {
                        id: 6,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 1,
                                actor: {
                                    _value: 1000004,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: {
                                    _value: 1000007,
                                    _ver: 1
                                }
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member02') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 0,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: {
                            'item-group': [
                                {
                                    item: [
                                        {
                                            type: {
                                                _value: 30036
                                            },
                                            content: '000000000'
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member03') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 1,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member04') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 3,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member05') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 2,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member06') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: null,
                        userInformation: null
                    }
                ]).end();
            } else {
                res.status(204).end();
            }
        });
        this.server = this.app.listen(3005);
    }
}

export class MyConditionBookManageServer02 {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/book-manage/identity', (req: express.Request, res: express.Response) => {
            if (req.body.pxrId === 'personal_member01') {
                res.status(200).json(identification).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.post('/book-manage/cooperate/request', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({
                    pxrId: '58di2dfse2.test.org',
                    userId: '123456',
                    actor: {
                        _value: 1000003,
                        _ver: 1
                    },
                    wf: {
                        _value: 1000004,
                        _ver: 1
                    },
                    status: 0
                }).end();
            } else {
                res.status(status).end();
            }
        });
        this.app.post('/book-manage/cooperate/request/release', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({
                    result: 'test'
                }).end();
            } else {
                res.status(status).end();
            }
        });
        this.app.post('/book-manage/search', (req: express.Request, res: express.Response) => {
            if (status === 200 && req.body.pxrId[0] === 'personal_member01') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                actor: {
                                    _value: 1000005,
                                    _ver: 1
                                },
                                app: {
                                    _value: 1000008,
                                    _ver: 2
                                }
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (status === 200) {
                res.status(204).end();
            } else {
                res.status(status).end();
            }
        });
        this.server = this.app.listen(3005);
    }
}

export class MyConditionBookManageServer03 {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/book-manage/identity', (req: express.Request, res: express.Response) => {
            if (req.body.pxrId === 'personal_member01') {
                res.status(200).json(identification).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.post('/book-manage/cooperate/request', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({
                    pxrId: '58di2dfse2.test.org',
                    userId: '123456',
                    actor: {
                        _value: 1000003,
                        _ver: 1
                    },
                    wf: {
                        _value: 1000004,
                        _ver: 1
                    },
                    status: 0
                }).end();
            } else {
                res.status(status).end();
            }
        });
        this.app.post('/book-manage/cooperate/request/release', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({
                    result: 'test'
                }).end();
            } else {
                res.status(status).end();
            }
        });
        this.app.post('/book-manage/cooperate/user', (req: express.Request, res: express.Response) => {
            res.status(status).json({}).end();
        });
        this.app.post('/book-manage/search', (req: express.Request, res: express.Response) => {
            if (req.body.pxrId[0] === 'personal_member01') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: null,
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member02') {
                res.status(200).json([
                    {
                        id: 2,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 0,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: {
                            'item-group': [
                                {
                                    item: [
                                        {
                                            type: {
                                                _value: 30036
                                            },
                                            content: '000000000'
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member03') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 1,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member04') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 3,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: null,
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member05') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: null,
                        userInformation: null
                    },
                    {
                        id: 2,
                        pxrId: 'test',
                        status: 0,
                        cooperation: [
                            {
                                status: 2,
                                actor: {
                                    _value: 1000020,
                                    _ver: 1
                                },
                                region: {
                                    _value: 1000011,
                                    _ver: 1
                                },
                                app: null,
                                wf: null
                            }
                        ],
                        userInformation: null
                    }
                ]).end();
            } else if (req.body.pxrId[0] === 'personal_member06') {
                res.status(200).json([
                    {
                        id: 1,
                        pxrId: 'test',
                        status: 0,
                        cooperation: null,
                        userInformation: null
                    }
                ]).end();
            } else {
                res.status(204).end();
            }
        });
        this.server = this.app.listen(3005);
    }
}

export class MyConditionBookManageServer04 {
    app: express.Express;
    server: Server;
    constructor (status: number) {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/book-manage/identity', (req: express.Request, res: express.Response) => {
            if (req.body.pxrId === 'personal_member01') {
                res.status(200).json(identification).end();
            } else {
                res.status(204).end();
            }
        });
        this.app.post('/book-manage/cooperate/request', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({
                    pxrId: '58di2dfse2.test.org',
                    userId: '123456',
                    actor: {
                        _value: 1000003,
                        _ver: 1
                    },
                    wf: {
                        _value: 1000004,
                        _ver: 1
                    },
                    status: 0
                }).end();
            } else {
                res.status(status).end();
            }
        });
        this.app.post('/book-manage/cooperate/request/release', (req: express.Request, res: express.Response) => {
            if (status === 200) {
                res.status(200).json({
                    result: 'test'
                }).end();
            } else {
                res.status(status).end();
            }
        });
        this.app.post('/book-manage/search', (req: express.Request, res: express.Response) => {
            res.status(200).json([
                {
                    id: 1,
                    pxrId: 'test',
                    status: 0,
                    cooperation: null,
                    userInformation: null
                }
            ]).end();
            if (!status) {
                this.server.close();
            }
        });
        this.server = this.app.listen(3005);
    }
}

export class MyConditionBookManageServerIndCollation {
    app: express.Express;
    server: Server;
    constructor () {
        this.app = express();
        this.app.use(express.json({ limit: '100mb' }));
        this.app.use(express.urlencoded({ extended: false }));
        this.app.post('/book-manage/cooperate/user', (req: express.Request, res: express.Response) => {
            res.json({
                result: 'test'
            }).end();
        });
        this.server = this.app.listen(3005);
    }
}
