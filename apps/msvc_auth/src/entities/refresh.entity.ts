import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { AccountEntity } from "./account.entity";

@Entity({ name: "refresh_tokens" })
export class RefreshEntity {

    @PrimaryGeneratedColumn("uuid")
    token!: string;

    @ManyToOne(() => AccountEntity, (a) => a.refreshTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "account_id" })
    account!: AccountEntity;

    @Column({ name: "account_id", type: "uuid" })
    accountId!: string;

    @CreateDateColumn({ name: "issued_at", type: "timestamptz" })
    issuedAt!: Date;

    @Column({ name: "expires_at", type: "timestamptz", default: () => "now() + interval '30 days'" })
    expiresAt!: Date;

    @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
    revokedAt?: Date | null;

    @Column({ type: 'inet', nullable: true })
    ip?: string | null;

    @Column({ name: "ua", type: "text", nullable: true })
    userAgent?: string | null; 
}