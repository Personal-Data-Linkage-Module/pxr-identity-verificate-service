/** Copyright 2022 NEC Corporation
Released under the MIT license.
https://opensource.org/licenses/mit-license.php
*/
import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    UpdateDateColumn,
    BaseEntity
} from 'typeorm';

/**
 * 本人性確認コードテーブルエンティティ
 */
@Entity('identify_verify')
export default class IdentifyVerifyEntity extends BaseEntity {
    /** 未確認 */
    public static readonly NON_VERIFIED = 0;
    /** 確認済み（成功） */
    public static readonly SUCCESS = 1;
    /** 確認に失敗 */
    public static readonly FAILED = 2;

    /** ID */
    @PrimaryGeneratedColumn({ type: 'bigint' })
    readonly id: number;

    /** 確認コード */
    @Column({ type: 'varchar', length: 255, nullable: false })
    code: string = '';

    /** アクターカタログコード */
    @Column({ type: 'bigint', nullable: false, name: 'actor_catalog_code' })
    actorCatalogCode: number = 0;

    /** アクターカタログバージョン */
    @Column({ type: 'bigint', nullable: false, name: 'actor_catalog_version' })
    actorCatalogVersion: number = 0;

    /** リージョンカタログコード */
    @Column({ type: 'bigint', name: 'region_catalog_code' })
    regionCatalogCode: number;

    /** リージョンカタログバージョン */
    @Column({ type: 'bigint', name: 'region_catalog_version' })
    regionCatalogVersion: number;

    /** アプリケーションカタログコード */
    @Column({ type: 'bigint', name: 'application_catalog_code' })
    applicationCatalogCode: number;

    /** アプリケーションカタログバージョン */
    @Column({ type: 'bigint', name: 'application_catalog_version' })
    applicationCatalogVersion: number;

    /** ワークフローカタログコード */
    @Column({ type: 'bigint', name: 'workflow_catalog_code' })
    workflowCatalogCode: number;

    /** ワークフローカタログバージョン */
    @Column({ type: 'bigint', name: 'workflow_catalog_version' })
    workflowCatalogVersion: number;

    /** PXR-ID */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'pxr_id' })
    pxrId: string = '';

    /** 利用者ID */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'user_id' })
    userId: string = '';

    /** 確認済みフラグ */
    @Column({ type: 'smallint', nullable: false, default: 0, name: 'is_verified' })
    isVerified: number = 0;

    /** 有効期限 */
    @Column({ type: 'timestamp without time zone', nullable: false, name: 'expiration_at' })
    expirationAt: Date = new Date();

    /** 削除フラグ */
    @Column({ type: 'boolean', nullable: false, default: false, name: 'is_disabled' })
    isDisabled: boolean = false;

    /** 登録者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'created_by' })
    createdBy: string = '';

    /** 登録日時 */
    @CreateDateColumn({ type: 'timestamp without time zone', name: 'created_at' })
    readonly createdAt: Date;

    /** 更新者 */
    @Column({ type: 'varchar', length: 255, nullable: false, name: 'updated_by' })
    updatedBy: string = '';

    /** 更新日時 */
    @UpdateDateColumn({ type: 'timestamp without time zone', name: 'updated_at', onUpdate: 'now()' })
    readonly updatedAt: Date;
}
