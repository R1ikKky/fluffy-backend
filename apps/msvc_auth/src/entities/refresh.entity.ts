import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "refresh_tokens" })
@Index( "idx_refresh_user_expires", ["userId", "expiresAt"] )
export class RefreshEntity {

    @PrimaryGeneratedColumn("uuid")
    token!: string;

    @Column({ name: "user_id", type: "uuid" })
    userId!: string;

    @ManyToOne(() => UserEntity, (u) => u.refreshTokens, { onDelete: "CASCADE" })
    user!: UserEntity;

    @CreateDateColumn({ name: "issued_at", type: "timestamptz" })
    issuedAt!: Date;

    @Column({ name: "expires_at", type: "timestamptz" })
    expiresAt!: Date;

    @Column({ name: "revoked_at", type: "timestamptz", nullable: true })
    revokedAt?: Date | null;

    @Column({ type: 'inet', nullable: true })
    ip?: string | null;

    @Column({ name: "ua", type: "text", nullable: true })
    userAgent?: string | null; 
}