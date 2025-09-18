import { Column, CreateDateColumn, Entity, Index, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { ContactEntity } from "./contact.entity";

@Entity({ name: "users" })
export class UserEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    // @Index({ unique: true })
    // @Column({ type: "citext", unique: true })
    // email!: string;

    @Index({ unique: true })
    @Column({ name: "first_name", type: 'citext', unique: true })
    firstName?: string;

    @Column({ name: 'second_name', type: 'text', default: "" })
    secondName?: string;

    // @Column({name: "pass_hash", type: "text"})
    // passHash!: string;

    @Column({ name: "avatar_url", type: "text", unique: true })
    avatarUrl?: string | null;

    // @Column({ name: 'is_verified', type: 'boolean', default: false })
    // isVerified!: boolean;

    @Column({ type: "text", nullable: true })
    bio?: string | null;  

    @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
    createdAt!: Date;

    @UpdateDateColumn({ name: 'updated_at', type: "timestamptz" })
    updatedAt!: Date;

    @OneToMany(() => ContactEntity, (c) => c. owner)
    myContacts!: ContactEntity;

    @OneToMany(() => ContactEntity, (c) => c. peer)
    inContacts!: ContactEntity;
}