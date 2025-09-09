import { Column, CreateDateColumn, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "refresh_tokens" })
export class RefreshEntity {

    @PrimaryGeneratedColumn("uuid")
    token!: string;

    @ManyToOne(() => UserEntity, (u) => u.refreshTokens, { onDelete: "CASCADE" })
    @JoinColumn({ name: "user_id" })
    user!: UserEntity;

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