/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import { Request, Response } from 'express';
import PostUserSettingsReqDto from './dto/PostUserSettingsReqDto';
/* eslint-enable */
import {
    JsonController, Post, Body, Header, Res, Req, UseBefore
} from 'routing-controllers';
import EnableSimpleBackPressure from './backpressure/EnableSimpleBackPressure';
import UserRequestValidator from './validator/UserRequestValidator';
import OperatorService from '../services/OperatorService';
import UserService from '../services/UserService';

@JsonController('/identity-verificate')
export default class UserController {
    // 利用者情報設定API
    @Post('/user/settings')
    @Header('X-Content-Type-Options', 'nosniff')
    @Header('X-XSS-Protection', '1; mode=block')
    @Header('X-Frame-Options', 'deny')
    @EnableSimpleBackPressure()
    @UseBefore(UserRequestValidator)
    async postUserSettings (@Req() req: Request, @Body() dto: PostUserSettingsReqDto, @Res() res: Response): Promise<any> {
        // オペレーター情報を取得
        const operator = await OperatorService.authMe(req);

        // 利用者情報設定を実行
        const ret = await UserService.postUserSettings(operator, dto);

        // レスポンスを返す
        return ret;
    }
}
