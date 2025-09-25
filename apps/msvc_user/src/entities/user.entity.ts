import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ContactEntity } from './contact.entity';

@Entity({ name: 'users' })
export class UserEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ nullable: true, type: 'citext', unique: true })
  username?: string | null;

  @Column({ name: 'first_name', type: 'text', default: '', nullable: true })
  firstName!: string | null;

  @Column({ name: 'second_name', type: 'text', default: '', nullable: true })
  secondName?: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl?: string | null;

  @Column({ type: 'text', nullable: true })
  bio?: string | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => ContactEntity, (c) => c.owner)
  myContacts!: ContactEntity;

  @OneToMany(() => ContactEntity, (c) => c.peer)
  inContacts!: ContactEntity;

  // @Column({name: "pass_hash", type: "text"})
  // passHash!: string;

  // @Index({ unique: true })
  // @Column({ type: "citext", unique: true })
  // email!: string;

  // @Column({ name: 'is_verified', type: 'boolean', default: false })
  // isVerified!: boolean;
}
