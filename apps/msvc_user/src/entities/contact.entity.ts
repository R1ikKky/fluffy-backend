import { Column, CreateDateColumn, Entity, Index, ManyToOne, PrimaryGeneratedColumn } from "typeorm";
import { UserEntity } from "./user.entity";

@Entity({ name: "contacts" })
@Index( "unique_contacts_owner_peer" , ["ownerId", "peerId"] , { unique: true })
export class ContactEntity{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({ name: "owner_id", type: "uuid" })
    ownerId!: string;

    @ManyToOne(() => UserEntity, (u) => u.myContacts, {
        onDelete: "CASCADE"
    })
    owner!: UserEntity;

    @Column({ name: "peer_id", type: "uuid" })
    peerId!: string;

    @ManyToOne(() => UserEntity, (u) => u.inContacts, {
        onDelete: "CASCADE"
    })
    peer!: UserEntity;

    @CreateDateColumn({ name: "created_at", type: "timestamptz" })
    createdAt!: Date;
}