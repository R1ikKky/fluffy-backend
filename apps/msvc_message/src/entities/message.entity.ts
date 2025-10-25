import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  Index,
} from "typeorm";

@Entity({ name: "messages" })
@Index("inx_messages_chat_created", ["chatId", "createdAt"])
export class MessageEntity{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name:"chat_id", type: "uuid" })
    chatId!: string;

    @Column({ name: "sender_id", type: "uuid" })
    senderId!: string;

    @Column({ type: "text", nullable: true })
    text!: string | null;

    @Column({ type: "jsonb", default: () => "'[]'" })
    attachments!: any[];

    @CreateDateColumn({ name: "created_at", type: "timestamptz", default: () => "now()" })
    createdAt!: Date;

    @UpdateDateColumn({ name: "edited_at", type: "timestamptz", nullable: true })
    editedAt!: Date | null;
    
    @DeleteDateColumn({ name: "deleted_at", type: "timestamptz", nullable: true })
    deletedAt!: Date | null;
}
