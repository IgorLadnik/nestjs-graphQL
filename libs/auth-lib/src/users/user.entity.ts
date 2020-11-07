import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity({ name: 'users' })
export class User {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ length: 10, unique: true })
  id: string;

  @Column({ length: 20, nullable: false })
  userName: string;

  @Column({ length: 20, nullable: false })
  password: string;

  @Column({ length: 20, nullable: false })
  permissions: string;
}
