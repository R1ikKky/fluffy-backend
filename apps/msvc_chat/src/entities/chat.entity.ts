import { Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn } from "typeorm";
import { MemberEntity } from "./member.entity";


export type ChatType = "direct" | "group";

@Entity({ name: "chats" })
export class ChatEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ type: "text" })
    type!: ChatType;

    @Column({ type: "text", nullable: true })
    title!: string;

    @Column({ name: "avatar_url", type: "text", nullable: true })
    avatarUrl!: string | null;

    @Column({ name: "owner_id", type: "uuid", nullable: true })
    ownerId!: string | null;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "updated_at", type: "timestamptz" })
    updatedAt!: Date;

    @OneToMany(() => MemberEntity, (member) => member.chat, { cascade: true })
    members!: MemberEntity[];
}