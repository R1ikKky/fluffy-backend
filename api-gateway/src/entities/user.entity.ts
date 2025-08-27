import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";


@Entity()
export class User{
    @PrimaryGeneratedColumn("uuid")
    uid!: number;

    @Column()
    username!: string;
}