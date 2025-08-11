import { Column, Entity, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class UserEntity{
    @PrimaryGeneratedColumn()
    id!: number

    @Column()
    furstName!: string

    @Column()
    lastName!: string

    @Column()
    description!: string

}