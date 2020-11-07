import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { Affiliation } from './affiliation.entity';

@Entity({ name: 'relations' })
export class Relation {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ length: 10, unique: true })
  id: string;

  @Column('int', { nullable: true })
  since: number;

  @Column({ length: 15, unique: false })
  kind: string;

  @Column({ length: 50, unique: false, nullable: true })
  notes: string;

  @ManyToOne(
    type => Person,
    p1 => p1.relations,
  )
  p1: Person;

  @ManyToOne(
    type => Person,
    p2 => p2.relations,
  )
  p2: Person;
}
