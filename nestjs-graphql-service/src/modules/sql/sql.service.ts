import { Injectable } from '@nestjs/common';
import { SqlTransaction } from 'sql-base-lib';
import { Person } from './entities/person.entity';
import { Affiliation } from './entities/affiliation.entity';
import { Organization } from './entities/organization.entity';
import { Role } from './entities/role.entity';
import { Relation } from './entities/relation.entity';
import { logger } from 'logger-lib';
import { Gql } from 'gql-module-lib';
const _ = require('lodash');
import { Connection } from 'typeorm';

const xx = '        database query: ';

@Injectable()
export class SqlService extends SqlTransaction {
  constructor(connection: Connection) {
    super(connection);
  }

  // Queries

  allPersons = async (context, info): Promise<Person[]> =>
    await Gql.processQuery(this, context, info, Person,
     // fnQuery
     async select => await this.connection.getRepository(Person).query(
          `SELECT ${select} FROM persons`));

  personById = async (context, info, arg): Promise<Person[]> =>
    await Gql.processQuery(this, context, info, Person,
      // fnQuery
      async select => await this.connection.getRepository(Person).query(
        `SELECT ${select} FROM persons WHERE id = \'${arg}\'`),
      // fnTransformResponse
      (data, errors) => {
        if (errors) {
          errors.splice(0, errors.length);
          errors.push({message: '[transformed] Query failed'});
        }
        else {
          const result = data.personById;
          if (result && result.surname)
            result.surname += ' [transformed] Maharadjah of Lucknow';
        }
      });

  personsBySurname = async (context, info, surname: string): Promise<Person[]> =>
    await Gql.processQuery(this, context, info, Person,
      async select => await this.connection.getRepository(Person).query(
        `SELECT ${select} FROM persons WHERE surname = \'${surname}\'`));

  allOrganizations = async (context, info): Promise<Organization[]> =>
    await Gql.processQuery(this, context, info, Organization,
      async select => await this.connection.getRepository(Organization).query(
        `SELECT ${select} FROM organizations`));


  // Fields  - from database

  affiliationsInPerson = async (info, persons) =>
    await Gql.processField(info, persons, Affiliation, this.connection,
      'FROM affiliations WHERE person_id IN _id');

  relations = async (info, persons) =>
    await Gql.processField(info, persons, Relation, this.connection,
      'FROM relations WHERE p1_id IN _id');

  organizationsInAffiliation = async (info, affiliations) =>
    await Gql.processField(info, affiliations, Organization, this.connection,
      'FROM organizations WHERE _id IN organization_id');

  parentsInOrganization = async (info, organizations) =>
    await Gql.processField(info, organizations, Organization, this.connection,
      'FROM organizations WHERE _id IN parent_id');

  roles = async (info, affiliations) =>
    await Gql.processField(info, affiliations, Role, this.connection,
      'FROM roles WHERE _id IN role_id');

  p2 = async (info, relations) =>
    await Gql.processField(info, relations, Person, this.connection,
      'FROM persons WHERE _id IN p2_id');


  // Fields  - from cache

  affiliationsFromCache = (context, info, parent) => {
    logger.log(`-> affiliationsFromCache level = ${Gql.getLevel(info)}`); //TEST
    return Gql.getFromCache(context, 'Affiliation', true, parent._id, 'person_id');
  }

  relationsFromCache = (context, info, parent) => {
    logger.log(`-> relationsFromCache level = ${Gql.getLevel(info)}`); //TEST
    return Gql.getFromCache(context, 'Relation', true, parent._id, 'p1_id');
  }

  parentFromCache = (context, info, parent) => {
    logger.log(`-> parentFromCache level = ${Gql.getLevel(info)}`); //TEST
    return Gql.getFromCache(context, 'Organization', false, parent.parent_id, '_id');
  }

  organizationFromCache = (context, info, parent) => {
    logger.log(`-> organizationFromCache level = ${Gql.getLevel(info)}`); //TEST
    return Gql.getFromCache(context, 'Organization', false, parent.organization_id, '_id');
  }

  roleFromCache = (context, info, parent) => {
    logger.log(`-> roleFromCache level = ${Gql.getLevel(info)}`); //TEST
    return Gql.getFromCache(context, 'Role', false, parent.role_id, '_id');
  }

  p2FromCache = (context, info, parent) => {
    logger.log(`-> p2FromCache level = ${Gql.getLevel(info)}`); //TEST
    return Gql.getFromCache(context, 'Person', false, parent.p2_id, '_id');
  }


  // Mutations

  personByIdField = async (arg): Promise<Person> => {
    const strWhere = typeof arg === 'string' ? `id = \'${arg}\'` : `_id = ${arg.p2_id}`;
    const queryStr = `SELECT * FROM persons WHERE ${strWhere}`;
    logger.log(`${xx} personByIdField: ${queryStr}`);
    return (await this.connection.getRepository(Person).query(queryStr))?.[0];
  }

  organizationById = async (organizationId): Promise<Organization> =>
    (await this.connection.getRepository(Organization)
        .query(`SELECT * FROM organizations WHERE id = \'${organizationId}\'`)
    )?.[0];

  roleById = async (roleId): Promise<Role> =>
    (await this.connection.getRepository(Role)
        .query(`SELECT * FROM roles WHERE id = \'${roleId}\'`)
    )?.[0];

  createPersons = async (inputPersons): Promise<any> => {
    let isOK = true;
    let message = '';

    const queryRunner = await this.beginTransaction();

    try {
      for (const inputPerson of inputPersons) {
        const person = new Person();
        person.id = inputPerson.id;
        person.givenName = inputPerson.givenName;
        person.surname = inputPerson.surname;
        person.address = inputPerson.address;
        person.born = inputPerson.born;
        person.phone = inputPerson.phone;
        person.email = inputPerson.email;

        if (inputPerson.affiliations && inputPerson.affiliations.length > 0) {
          person.affiliations = new Array<Affiliation>();
          for (const aff of inputPerson.affiliations) {
            const affiliation = new Affiliation();
            affiliation.id = aff.id;
            affiliation.organization = await this.organizationById(
              aff.organizationId,
            );
            affiliation.role = await this.roleById(aff.roleId);
            affiliation.since = aff.since;
            affiliation.person = person;
            person.affiliations.push(affiliation);
          }
        }

        if (inputPerson.relations && inputPerson.relations.length > 0) {
          person.relations = new Array<Relation>();
          for (const rel of inputPerson.relations) {
            const relation = new Relation();
            relation.id = rel.id;
            relation.p1 = person;
            relation.p2 = await this.personByIdField(rel.p2Id);
            relation.kind = rel.kind;
            relation.since = rel?.since;
            relation.notes = rel?.notes;
            person.relations.push(relation);
          }
        }

        await queryRunner.manager.save(person);

        if (person.affiliations)
          await queryRunner.manager.save(person.affiliations);

        if (person.relations) await queryRunner.manager.save(person.relations);
      }
    }
    catch (err) {
      isOK = false;
      message =
        err.code === 'EREQUEST'
          ? 'Entries already exist in database. '
          : `${err}`;
      logger.error(`Transaction rolled back: ${message}`);
    }

    //return { queryRunner, isOK, message };

    if (isOK)
      message = 'Success';
    else
      if (message.length === 0)
        message = 'Failure';

    await this.endTransaction({ queryRunner, isOK, message });

    return message;
  };
}
