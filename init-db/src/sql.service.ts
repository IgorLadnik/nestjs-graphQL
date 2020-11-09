import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { SqlTransaction } from 'sql-base-lib';
import { Relation } from './sql/entities/relation.entity';
import { Affiliation } from './sql/entities/affiliation.entity';
import { Person } from './sql/entities/person.entity';
import { Organization } from './sql/entities/organization.entity';
import { Role } from './sql/entities/role.entity';
import { User } from './sql/entities/user.entity';

@Injectable()
export class SqlService extends SqlTransaction {
  constructor(connection: Connection) {
    super(connection);

    setImmediate(async () => await this.initInsertSql());
  }

  async initInsertSql() {
    // Empty database
    try {
      await this.connection.getRepository(Relation).query('DELETE FROM relations');
      await this.connection.getRepository(Affiliation).query('DELETE FROM affiliations');
      await this.connection.getRepository(Person).query('DELETE FROM persons');
      await this.connection.getRepository(Organization).query('DELETE FROM organizations');
      await this.connection.getRepository(Role).query('DELETE FROM roles');
      await this.connection.getRepository(User).query('DELETE FROM users');
    }
    catch (err) {
      console.log(err);
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Roles
      const roles = [];
      let roleStudent, roleProfessor, roleDirector;
      {
        const role = new Role();
        role.id = 'l_st';
        role.name = 'Student';
        role.description = 'Subject to brainwash';
        roles.push(role);
        roleStudent = role;
      }
      {
        const role = new Role();
        role.id = 'l_pr';
        role.name = 'Professor';
        role.description = 'Brainwasher';
        roles.push(role);
        roleProfessor = role;
      }
      {
        const role = new Role();
        role.id = 'l_dr';
        role.name = 'Director';
        role.description = 'Main brainwasher';
        roles.push(role);
        roleDirector = role;
      }

      await queryRunner.manager.save(roles);

      // Organizations
      const orgA = new Organization();
      orgA.id = 'o_a';
      orgA.name = 'University A';
      orgA.address = '1, A St.';

      const orgB = new Organization();
      orgB.id = 'o_b';
      orgB.name = 'University B';
      orgB.address = '2, B St.';

      const orgA1 = new Organization();
      orgA1.id = 'o_a1';
      orgA1.name = 'A - Dept. ME';
      orgA1.address = '1, A St., 1st floor';

      const orgA2 = new Organization();
      orgA2.id = 'o_a2';
      orgA2.name = 'A - Dept. CS';
      orgA2.address = '1, A St., 2nd floor';

      const orgB1 = new Organization();
      orgB1.id = 'o_b1';
      orgB1.name = 'B - Dept. EE';
      orgB1.address = '2, B St., 1st floor';

      await queryRunner.manager.save([orgA, orgB, orgA1, orgA2, orgB1]); //!

      orgA1.parent = orgA;
      orgA2.parent = orgA;
      orgB1.parent = orgB;

      await queryRunner.manager.save([orgA, orgB, orgA1, orgA2, orgB1]); //!

      // Persons
      const persons = [];

      {
        const person = new Person();
        person.id = 'p_01';
        person.givenName = 'John';
        person.surname = 'Croft';
        person.born = 2000;
        person.phone = '237-006-171';
        person.email = 'jcroft@ua.ac.zz';
        person.address = '1, Plum St.';
        persons.push(person);
      }
      {
        const person = new Person();
        person.id = 'p_02';
        person.givenName = 'Moshe';
        person.surname = 'Cohen';
        person.born = 1970;
        person.phone = '456-543-543';
        person.email = 'mcohen@ua.ac.zz';
        person.address = '5, Olive Av.';
        persons.push(person);
      }
      {
        const person = new Person();
        person.id = 'p_03';
        person.givenName = 'Ann';
        person.surname = 'Anders';
        person.born = 1980;
        person.phone = '321-346-377';
        person.email = 'aanders@ub.ac.zz';
        person.address = '10, Apple Dr.';
        persons.push(person);
      }
      {
        const person = new Person();
        person.id = 'p_04';
        person.givenName = 'Alexander';
        person.surname = 'Petrov';
        person.born = 1990;
        person.phone = '860-473-007';
        person.email = 'apetrov@ub.ac.zz';
        person.address = '19, Peach Rd.';
        persons.push(person);
      }
      {
        const person = new Person();
        person.id = 'p_05';
        person.givenName = 'Jose';
        person.surname = 'Hernandez';
        person.born = 1967;
        person.phone = '206-178-211';
        person.email = 'jhernandez@ub.ac.zz';
        person.address = '35, Orange St.';
        persons.push(person);
      }

      await queryRunner.manager.save(persons);

      // Affiliations
      const affiliations = [];
      {
        const aff = new Affiliation();
        aff.id = 'a_01';
        aff.organization = orgA1;
        aff.role = roleStudent;
        aff.since = 2018;
        aff.person = persons[0];
        affiliations.push(aff);
      }
      {
        const aff = new Affiliation();
        aff.id = 'a_02';
        aff.organization = orgA1;
        aff.role = roleProfessor;
        aff.since = 2015;
        aff.person = persons[1];
        affiliations.push(aff);
      }
      {
        const aff = new Affiliation();
        aff.id = 'a_03';
        aff.organization = orgA;
        aff.role = roleDirector;
        aff.since = 2017;
        aff.person = persons[1];
        affiliations.push(aff);
      }
      {
        const aff = new Affiliation();
        aff.id = 'a_04';
        aff.organization = orgA2;
        aff.role = roleProfessor;
        aff.since = 2014;
        aff.person = persons[2];
        affiliations.push(aff);
      }
      {
        const aff = new Affiliation();
        aff.id = 'a_05';
        aff.organization = orgA2;
        aff.role = roleStudent;
        aff.since = 2018;
        aff.person = persons[0];
        affiliations.push(aff);
      }
      {
        const aff = new Affiliation();
        aff.id = 'a_06';
        aff.organization = orgB1;
        aff.role = roleStudent;
        aff.since = 2018;
        aff.person = persons[3];
        affiliations.push(aff);
      }
      {
        const aff = new Affiliation();
        aff.id = 'a_07';
        aff.organization = orgB1;
        aff.role = roleProfessor;
        aff.since = 2018;
        aff.person = persons[4];
        affiliations.push(aff);
      }
      {
        const aff = new Affiliation();
        aff.id = 'a_08';
        aff.organization = orgB;
        aff.role = roleDirector;
        aff.since = 2020;
        aff.person = persons[4];
        affiliations.push(aff);
      }

      await queryRunner.manager.save(affiliations);

      // Relations
      const relations = [];
      {
        const relation = new Relation();
        relation.id = 'r_01';
        relation.p1 = persons[1];
        relation.p2 = persons[4];
        relation.kind = 'committee';
        relation.since = 2020;
        relations.push(relation);
      }
      {
        const relation = new Relation();
        relation.id = 'r_02';
        relation.p1 = persons[0];
        relation.p2 = persons[1];
        relation.kind = 'superior';
        relation.since = 2016;
        relations.push(relation);
      }
      {
        const relation = new Relation();
        relation.id = 'r_03';
        relation.p1 = persons[2];
        relation.p2 = persons[1];
        relation.kind = 'superior';
        relation.since = 2016;
        relations.push(relation);
      }
      {
        const relation = new Relation();
        relation.id = 'r_04';
        relation.p1 = persons[3];
        relation.p2 = persons[4];
        relation.kind = 'superior';
        relation.since = 2016;
        relations.push(relation);
      }

      await queryRunner.manager.save(relations);

      // Users
      const users = [];
      {
        const user = new User();
        user.id = 'u_01';
        user.userName = 'Rachel';
        user.password = 'rrr';
        user.permissions = '11';
        users.push(user);
      }
      {
        const user = new User();
        user.id = 'u_02';
        user.userName = 'Sandeep';
        user.password = 'sss';
        user.permissions = '10';
        users.push(user);
      }
      {
        const user = new User();
        user.id = 'u_03';
        user.userName = 'Nick';
        user.password = 'nnn';
        user.permissions = '00';
        users.push(user);
      }

      await queryRunner.manager.save(users);

      // Commit transaction
      await queryRunner.commitTransaction();
    }
    catch (err) {
      await queryRunner.rollbackTransaction();
      console.log(`Transaction rolled back: ${err}`);
    }
    finally {
      await queryRunner.release();
    }
  }
}
