import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Person } from './person.entity';
import { Organization } from './organization.entity';
import { Role } from './role.entity';
import { Relation } from './relation.entity';

@Entity({ name: 'affiliations' })
export class Affiliation {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ length: 10, unique: true })
  id: string;

  @Column('int', { nullable: true })
  since: number;

  @ManyToOne(
    type => Organization,
    organization => organization.affiliations,
  )
  organization: Organization;

  @ManyToOne(
    type => Role,
    role => role.affiliations,
  )
  role: Role;

  @ManyToOne(
    type => Person,
    person => person.affiliations,
  )
  person: Person;
}
