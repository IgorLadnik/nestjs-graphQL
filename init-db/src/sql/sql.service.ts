import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { SqlTransaction } from 'sql-base-lib';
import { Relation } from './entities/relation.entity';
import { Affiliation } from './entities/affiliation.entity';
import { Person } from './entities/person.entity';
import { Organization } from './entities/organization.entity';
import { Role } from './entities/role.entity';

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
    }
    catch (err) {
      console.log(err);
    }

    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Roles
      const roleStudent = new Role();
      roleStudent.id = 'l_st';
      roleStudent.name = 'Student';
      roleStudent.description = 'Subject to brainwash';

      const roleProfessor = new Role();
      roleProfessor.id = 'l_pr';
      roleProfessor.name = 'Professor';
      roleProfessor.description = 'Brainwasher';

      const roleDirector = new Role();
      roleDirector.id = 'l_dr';
      roleDirector.name = 'Director';
      roleDirector.description = 'Main brainwasher';

      await queryRunner.manager.save([
        roleStudent,
        roleProfessor,
        roleDirector,
      ]);

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

      // Persons create
      const persons = new Array<Person>();
      for (let i = 0; i < 5; i++) persons[i] = new Person();

      // Persons fill
      persons[0].id = 'p_01';
      persons[0].givenName = 'John';
      persons[0].surname = 'Croft';
      persons[0].born = 2000;
      persons[0].phone = '237-006-171';
      persons[0].email = 'jcroft@ua.ac.zz';
      persons[0].address = '1, Plum St.';

      persons[1].id = 'p_02';
      persons[1].givenName = 'Moshe';
      persons[1].surname = 'Cohen';
      persons[1].born = 1970;
      persons[1].phone = '456-543-543';
      persons[1].email = 'mcohen@ua.ac.zz';
      persons[1].address = '5, Olive Av.';

      persons[2].id = 'p_03';
      persons[2].givenName = 'Ann';
      persons[2].surname = 'Anders';
      persons[2].born = 1980;
      persons[2].phone = '321-346-377';
      persons[2].email = 'aanders@ub.ac.zz';
      persons[2].address = '10, Apple Dr.';

      persons[3].id = 'p_04';
      persons[3].givenName = 'Alexander';
      persons[3].surname = 'Petrov';
      persons[3].born = 1990;
      persons[3].phone = '860-473-007';
      persons[3].email = 'apetrov@ub.ac.zz';
      persons[3].address = '19, Peach Rd.';

      persons[4].id = 'p_05';
      persons[4].givenName = 'Jose';
      persons[4].surname = 'Hernandez';
      persons[4].born = 1967;
      persons[4].phone = '206-178-211';
      persons[4].email = 'jhernandez@ub.ac.zz';
      persons[4].address = '35, Orange St.';

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
