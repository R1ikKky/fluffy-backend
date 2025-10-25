import { Column, CreateDateColumn, Entity, PrimaryColumn } from "typeorm";

@Entity({ name: "reads" })
export class ReadEntity {
    @PrimaryColumn({ name: "chat_id", type: "uuid"})
    chatId!: string;
    
    @PrimaryColumn({ name: "user_id", type: "uuid" })
    userId!: string;

    @Column({ name: "message_id", type: "uuid"})
    message!: string;

    @CreateDateColumn({ name: "read_at", type: "timestamptz", default: () => "now()" })
    readAt!: Date;
}