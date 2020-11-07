import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  OneToOne,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { Affiliation } from './affiliation.entity';
import { Person } from './person.entity';

@Entity({ name: 'roles' })
export class Role {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ length: 10, unique: true })
  id: string;

  @Column({ length: 30, unique: true })
  name: string;

  @Column({ length: 50, nullable: true })
  description: string;

  @OneToMany(
    type => Affiliation,
    affiliation => affiliation.person,
  )
  affiliations: Affiliation[];
}
