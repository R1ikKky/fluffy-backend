import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { RefreshEntity } from "./refresh.entity";

@Entity({ name: "users" })
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index({ unique: true })
    @Column({ type: "citext", unique: true })
    email!: string;

    @Column({name: "pass_hash", type: "text"})
    passHash!: string;

    @Column({ name: 'is_verified', type: 'boolean', default: false })
    isVerified!: boolean;

    @Column({ name: "first_name" })
    firstName!: string;

    @Column({ name: "second_name" })
    secondName!: string;

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @Column({ type: "text" })
    description!: string

    @OneToMany(() => RefreshEntity, (r) => r.user)
    refreshTokens!: RefreshEntity[];


}