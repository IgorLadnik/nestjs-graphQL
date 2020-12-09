import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany
} from 'typeorm';
import { Affiliation } from './affiliation.entity';
import { Relation } from './relation.entity';

@Entity({ name: 'persons' })
export class Person {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ length: 10, unique: true })
  id: string;

  @Column({ length: 20 })
  givenName: string;

  @Column({ length: 20 })
  surname: string;

  @Column('int', { nullable: true })
  born: number;

  @Column({ length: 20, nullable: true })
  phone: string;

  @Column({ length: 20, nullable: true })
  email: string;

  @Column({ length: 50, nullable: true })
  address: string;

  @OneToMany(
    type => Affiliation,
    affiliation => affiliation.person,
  )
  affiliations: Affiliation[];

  @OneToMany(
    type => Relation,
    relation => relation.p1 && relation.p2,
  )
  relations: Relation[];
}
