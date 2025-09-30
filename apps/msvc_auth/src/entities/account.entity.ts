import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RefreshEntity } from "./refresh.entity";

@Entity({ name: "accounts" })
export class AccountEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index({ unique: true })
    @Column({ type: "citext", unique: true })
    email!: string;

    @Column({name: "pass_hash", type: "text"})
    passHash!: string;

    @Column({ name: 'is_verified', type: 'boolean', default: false })
    isVerified!: boolean;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @OneToMany(() => RefreshEntity, (r) => r.account)
    refreshTokens!: RefreshEntity[];

    
}