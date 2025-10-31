import { Column, CreateDateColumn, Entity, Index, JoinColumn, ManyToOne, PrimaryGeneratedColumn, Unique } from "typeorm";
import { ChatEntity } from "./chat.entity";

export type MemberRole = "owner" | "admin" | "member";

@Entity({ name: "member" })
@Unique(["chatId", "userId"])
export class MemberEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Index("inx_chats") // for rapid search chat's members
    @Column({ name: "chat_id", type: "uuid" })
    chatId!: string;

    @Index("idx_users") // for rapid search user's chats
    @Column({ name: "user_id", type: "uuid" })
    userId!: string;

    @Column({ type: "text", default: "member" })
    role!: MemberRole;

    @CreateDateColumn({ name: "joined_at", type: "timestamptz" })
    joinedAt!: Date;

    @ManyToOne(() => ChatEntity, (chat) => chat.members, {
        onDelete: "CASCADE"
    })
    @JoinColumn({ name: "chat_id" })
    chat!: ChatEntity;
}