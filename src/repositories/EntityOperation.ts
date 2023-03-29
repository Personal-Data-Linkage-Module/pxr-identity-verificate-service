/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
/* eslint-disable */
import Operator from '../domains/OperatorDomain';
import IdentifyVerifyEntity from '../repositories/postgres/IdentifyVerifyEntity';
import AppError from '../common/AppError';
import { sprintf } from 'sprintf-js';
import { getRepository, QueryRunner } from 'typeorm';
import { ResponseCode } from '../common/ResponseCode';
import { connectDatabase } from '../common/Connection';
/* eslint-enable */
import Config from '../common/Config';
import IdentifyVerifyUrlEntity from './postgres/IdentifyVerifyUrlEntity';
const Message = Config.ReadConfig('./config/message.json');

/**
 * 本人性確認テーブルエンティティ操作用 サービスクラス
 */
export class EntityOperation {
    /**
     * 本人性確認エンティティをテーブルに保存する
     * @param entity
     * @param operator
     */
    static async saveIdentifyVerifyEntity (
        entity: IdentifyVerifyEntity, operator: Operator
    ): Promise<IdentifyVerifyEntity> {
        const connection = await connectDatabase();
        let queryRunner: QueryRunner = null;
        entity.createdBy = operator.loginId;
        entity.updatedBy = operator.loginId;
        try {
            queryRunner = connection.createQueryRunner();
            await queryRunner.startTransaction();
            const ret = await queryRunner.manager.save(entity);
            await queryRunner.commitTransaction();
            return ret;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new AppError(
                Message.FAILED_SAVE_ENTITY, ResponseCode.INTERNAL_SERVER_ERROR, err);
        } finally {
            await queryRunner.release();
            // await connection.close();
        }
    }

    /**
     * 本人性確認用URLエンティティをテーブルに保存する
     * @param entity
     * @param operator
     */
    static async saveIdentifyVerifyUrlEntity (
        entity: IdentifyVerifyUrlEntity, operator: Operator
    ): Promise<IdentifyVerifyUrlEntity> {
        const connection = await connectDatabase();
        let queryRunner: QueryRunner = null;
        entity.createdBy = operator.loginId;
        entity.updatedBy = operator.loginId;
        try {
            queryRunner = connection.createQueryRunner();
            await queryRunner.startTransaction();
            const ret = await queryRunner.manager.save(entity);
            await queryRunner.commitTransaction();
            return ret;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new AppError(
                Message.FAILED_SAVE_ENTITY, ResponseCode.INTERNAL_SERVER_ERROR, err);
        } finally {
            await queryRunner.release();
        }
    }

    /**
     * 引数のコードを保有するエンティティが存在するか、確認する
     * @param code
     */
    static async selectWithIdentifyCode (code: string): Promise<IdentifyVerifyEntity> {
        const connection = await connectDatabase();
        const entityRepository = getRepository(IdentifyVerifyEntity, connection.name);
        const entity = await entityRepository.findOne({
            where: { code: code, isDisabled: false }
        });
        if (!entity) {
            const mess = sprintf(Message.NOT_EXISTS_IDENTIFY_CODE, code);
            throw new AppError(mess, ResponseCode.BAD_REQUEST);
        }
        // await connection.close();
        return entity;
    }

    /**
     * 引数のエンティティ（既にデータベースに登録済みを前提）の更新処理
     * @param entity
     * @param operator
     */
    static async updateIdentifyVerifyEntity (
        entity: IdentifyVerifyEntity, operator: Operator
    ): Promise<IdentifyVerifyEntity> {
        const connection = await connectDatabase();
        let queryRunner: QueryRunner = null;
        entity.updatedBy = operator.loginId;
        try {
            queryRunner = connection.createQueryRunner();
            await queryRunner.startTransaction();
            const ret = await queryRunner.manager.save(entity);
            await queryRunner.commitTransaction();
            return ret;
        } catch (err) {
            await queryRunner.rollbackTransaction();
            throw new AppError(
                Message.FAILED_SAVE_ENTITY, ResponseCode.INTERNAL_SERVER_ERROR, err);
        } finally {
            await queryRunner.release();
            // await connection.close();
        }
    }

    /**
     * 引数のコードを保有するエンティティが存在するか、確認する
     * @param code
     */
    static async getUrlByCode (code: string): Promise<IdentifyVerifyUrlEntity> {
        const connection = await connectDatabase();
        const entityRepository = getRepository(IdentifyVerifyUrlEntity, connection.name);
        const entity = await entityRepository.findOne({
            where: { code: code, isDisabled: false }
        });
        if (!entity) {
            const mess = sprintf(Message.NOT_EXISTS_IDENTIFY_CODE, code);
            throw new AppError(mess, ResponseCode.BAD_REQUEST);
        }
        return entity;
    }
}
