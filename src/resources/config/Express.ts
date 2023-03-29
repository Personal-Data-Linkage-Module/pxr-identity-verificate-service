/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import 'reflect-metadata';
import * as express from 'express';
import * as bodyParser from 'body-parser';
import * as helmet from 'helmet';
import { useExpressServer, useContainer } from 'routing-controllers';
import { Container } from 'typedi';
import setupLogging from './Logging';
import setupHealthCheck from "./HealthCheck";
import GlobalValidate from '../validator/GlobalValidate';
import GlobalErrorHandler from '../handler/GlobalErrorHandler';
import SwaggerUi = require('swagger-ui-express');
import AcquisitionController from '../AcquisitionController';
import CodeController from '../CodeController';
import CollateController from '../CollateController';
import UrlController from '../UrlController';
import VerifyController from '../VerifyController';
import UserController from '../UserController';
import cookieParser = require('cookie-parser');
import Config from '../../common/Config';
/* eslint-enable */

export class ExpressConfig {
    app: express.Express;

    constructor () {
        this.app = express();

        setupLogging(this.app);
        // SDE-MSA-PRIN 監視に優しい設計にする （MSA-PRIN-CD-04）
        setupHealthCheck(this.app);
        // SDE-MSA-PRIN ステートレスにする （MSA-PRIN-SD-01）

        this.app.use(bodyParser.json({ limit: '100mb' }));
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(cookieParser());

        /**
         * HelmetによるHTTPヘッダーのセキュリティ対策設定
         */
        this.app.use(helmet());

        // SDE-IMPL-RECOMMENDED Content-Security-Policyの設定は以下で行ってください
        this.app.use(helmet.contentSecurityPolicy({
            directives: {
                defaultSrc: ["'self'"],
                styleSrc: ["'self'", "'unsafe-inline'"],
                imgSrc: ["'self'", 'data:']
            }
        }));

        // Swaggaer設定ファイルを読込
        const SwaggerConfig = Config.ReadConfig('./config/openapi.json');

        // Swagger UIのセットアップ
        this.app.use('/api-docs', SwaggerUi.serve, SwaggerUi.setup(SwaggerConfig));

        this.setupControllers();
    }

    setupControllers () {
        useContainer(Container);

        useExpressServer(this.app, {
            // SDE-IMPL-RECOMMENDED CORS（Cross-Origin Resource Sharing）設定は以下で行ってください。
            defaultErrorHandler: false,
            controllers: [
                AcquisitionController,
                CodeController,
                CollateController,
                UrlController,
                VerifyController,
                UserController
            ],
            middlewares: [GlobalValidate, GlobalErrorHandler],
            development: false
        });
    }
}
