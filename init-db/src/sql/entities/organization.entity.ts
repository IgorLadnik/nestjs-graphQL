import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToMany,
  ManyToOne,
  OneToOne,
  JoinColumn,
} from 'typeorm';
import { Affiliation } from './affiliation.entity';
import { Role } from './role.entity';
import { Person } from './person.entity';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn()
  _id: number;

  @Column({ length: 10, unique: true })
  id: string;

  @Column({ length: 50, unique: true })
  name: string;

  @Column({ length: 50, nullable: true })
  address: string;

  @OneToMany(
    type => Affiliation,
    affiliation => affiliation.organization,
  )
  affiliations: Affiliation[];

  @ManyToOne(
    type => Organization,
    organization => organization.parent,
  )
  parent: Organization;
}
