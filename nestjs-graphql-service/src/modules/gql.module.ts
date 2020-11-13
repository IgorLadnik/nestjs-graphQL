// Template for this file was automatically generated according to graphQL schema.
// The following block is subject to replacement on module runtime upload
// and should be maintained unchanged (including blanks).

// {
const isFromWeb = false;
let typePaths = [];
let path = '';
__dirname = '';
// }

if (isFromWeb)
  process.chdir(__dirname);

import { Injectable, Module, UseInterceptors, UseGuards } from '../../node_modules/@nestjs/common';
import {
  Resolver,
  Query,
  Mutation,
  Args,
  ResolveField,
  Parent,
  Context,
  Info
} from '../../node_modules/@nestjs/graphql';
import { ConfigService } from '../../node_modules/config-lib';
import { logger } from '../../node_modules/logger-lib';
import { AuthModule, GqlAuthGuard } from '../../node_modules/auth-lib';
import { DirHolder } from '../../node_modules/module-loader-lib';
import { Gql } from '../../node_modules/gql-module-lib';
import { SqlTransaction } from '../../node_modules/sql-base-lib';
import { Connection } from '../../node_modules/typeorm';
import { TypeOrmModule } from '../../node_modules/@nestjs/typeorm';
import { SqlConfig } from '../../node_modules/sql-base-lib';

import { Person } from '../sql/entities/person.entity';
import { Affiliation } from '../sql/entities/affiliation.entity';
import { Organization } from '../sql/entities/organization.entity';
import { Role } from '../sql/entities/role.entity';
import { Relation } from '../sql/entities/relation.entity';

const {
  ExecutionContextValidationInterceptor,
  DurationInterceptor,
  BaseExecutionContextValidator,
  TlsGuard
} = require('../../node_modules/interceptors-lib');

if (isFromWeb)
  process.chdir(DirHolder.getProjectDir());
else {
  const configService = new ConfigService();
  const urlJoin = require('url-join');
  typePaths = [urlJoin(configService.get('GQL_URL'), configService.get('GQL_SCHEMA'))];
  path = configService.get('GQL_PATH');
}

const { getGraphQLModule } = require(isFromWeb ? `./node_modules/gql-module-lib` : 'gql-module-lib');

///////////////////////////////////////////////////////////////////////////////////////////////////////

@Injectable()
class SqlService extends SqlTransaction {
  repoPerson;
  repoAffiliation;
  repoRelation;
  repoOrganization;
  repoRole;

  constructor(connection: Connection) {
    super(connection);

    this.repoPerson = this.connection.getRepository(Person);
    this.repoAffiliation = this.connection.getRepository(Affiliation);
    this.repoRelation = this.connection.getRepository(Relation);
    this.repoOrganization = this.connection.getRepository(Organization);
    this.repoRole = this.connection.getRepository(Role);
  }

  // Fields  - from database

  affiliationsInPerson = async (info, persons) =>
    await Gql.processField(info, persons, Affiliation, this.connection,
      'FROM affiliations WHERE person_id IN _id');

  relationsInPerson = async (info, persons) =>
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
}

@Resolver('Person')
export class PersonResolver {
  constructor(private service: SqlService) { }

  // Args:
  // Return: NonNullType,ListType,NonNullType,NamedType,Person
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async allPersons(@Context() context, @Info() info) {
    return await Gql.processQuery(this.service, context, info, Person,
                'SELECT * FROM persons');
  }

  // Args:   {id: NonNullType,NamedType,String}
  // Return: NamedType,Person
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async personById(@Context() context, @Info() info, @Args('id') id: string) {
    const persons = await Gql.processQuery(this.service, context, info, Person,
      `SELECT * FROM persons WHERE id = \'${id}\'`,
      undefined,
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
    return persons && persons.length > 0 ? persons[0] : [];
  }

  // Args:   {surname: NonNullType,NamedType,String}
  // Return: NamedType,Person
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async personsBySurname(@Context() context, @Info() info, @Args('surname') surname: string) {
    return await Gql.processQuery(this.service, context, info, Person,
       `SELECT * FROM persons WHERE surname = \'${surname}\'`);
  }

  // Args:   {relationQueryArg: NonNullType,ListType,NamedType,RelationQueryArg}
  // Return: ListType,NamedType,Person
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async personsByRelation(@Context() context, @Info() info, @Args('relationQueryArg') relationQueryArg: any[]) {
    let where = '(';
    for (let i = 0; i < relationQueryArg.length; i++) {
      where += `relations.kind = \'${relationQueryArg[i].kind}\'`;
      if (i < relationQueryArg.length - 1)
        where += ' OR ';
    }
    where += ')';

    return await Gql.processQuery(this.service, context, info, Person,
      `SELECT * 
           FROM persons 
           INNER JOIN relations 
           ON persons._id = relations.p1_id OR persons._id = relations.p2_id
           WHERE ${where}`,
      select => select.replace('_id', 'persons._id').replace(',id,', ',persons.id,'));
  }

  // Args:   {personsInput: NonNullType,ListType,NamedType,PersonInput}
  // Return: NamedType,String
  @Mutation()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async createPersons(@Args('personsInput') personsInput: any[]): Promise<string> {
    logger.log('createPersons()'); //TEST

    let isOK = true;
    let message = '';

    const queryRunner = await this.service.beginTransaction();

    try {
      for (const inputPerson of personsInput) {
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

    if (isOK)
      message = 'Success';
    else
    if (message.length === 0)
      message = 'Failure';

    await this.service.endTransaction({ queryRunner, isOK, message });

    return message;
  }

  private personByIdField = async (arg): Promise<Person> => {
    const strWhere = typeof arg === 'string' ? `id = \'${arg}\'` : `_id = ${arg.p2_id}`;
    const queryStr = `SELECT * FROM persons WHERE ${strWhere}`;
    return (await this.service.repoPerson.query(queryStr))?.[0];
  }

  private organizationById = async (organizationId): Promise<Organization> =>
    (await this.service.repoOrganization
        .query(`SELECT * FROM organizations WHERE id = \'${organizationId}\'`)
    )?.[0];

  private roleById = async (roleId): Promise<Role> =>
    (await this.service.repoRole
        .query(`SELECT * FROM roles WHERE id = \'${roleId}\'`)
    )?.[0];

  // Args:   {organization: NamedType,String},
  //         {role: NamedType,String},
  //         {since: NamedType,IntInput}
  // Return: ListType,NamedType,Affiliation
  @ResolveField('affiliations')
  @UseInterceptors(DurationInterceptor)
  async affiliations(@Context() context, @Info() info, @Parent() parent: any,
    @Args('organization') organization: any,
    @Args('role') role: any,
    @Args('since') since: any) {
    return Gql.getFromCache(context, 'Affiliation', true, parent._id, 'person_id');
  }

  // Args:   {kind: NamedType,String}
  // Return: ListType,NamedType,Relation
  @ResolveField('relations')
  @UseInterceptors(DurationInterceptor)
  async relations(@Context() context, @Info() info,
                  @Parent() parent: any,
                  @Args('kind') kind: any) {
    return Gql.getFromCache(context, 'Relation', true, parent._id, 'p1_id');
  }
}

@Resolver('Organization')
export class OrganizationResolver {
  constructor(private service: SqlService) { }

  // Args:
  // Return: NonNullType,ListType,NonNullType,NamedType,Organization
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async allOrganizations(@Context() context, @Info() info) {
    return await Gql.processQuery(this.service, context, info, Organization,
              'SELECT * FROM organizations');
  }

  // Args:
  // Return: NamedType,Organization
  @ResolveField('parent')
  @UseInterceptors(DurationInterceptor)
  async parent(@Context() context, @Info() info, @Parent() parent: any) {
    return Gql.getFromCache(context, 'Organization', false, parent.parent_id, '_id');
  }
}

@Resolver('Affiliation')
export class AffiliationResolver {
  constructor(private service: SqlService) { }

  // Args:
  // Return: NonNullType,NamedType,Organization
  @ResolveField('organization')
  @UseInterceptors(DurationInterceptor)
  async organization(@Context() context, @Info() info, @Parent() parent: any) {
    return Gql.getFromCache(context, 'Organization', false, parent.organization_id, '_id');
  }

  // Args:
  // Return: NamedType,Role
  @ResolveField('role')
  @UseInterceptors(DurationInterceptor)
  async role(@Context() context, @Info() info, @Parent() parent: any) {
    return Gql.getFromCache(context, 'Role', false, parent.role_id, '_id');
  }
}

@Resolver('Relation')
export class RelationResolver {
  constructor(private service: SqlService) { }

  // Args:
  // Return: NonNullType,NamedType,Person
  @ResolveField('p1')
  @UseInterceptors(DurationInterceptor)
  async p1(@Context() context, @Parent() parent: any) {
    return []; //@@
  }

  // Args:
  // Return: NonNullType,NamedType,Person
  @ResolveField('p2')
  @UseInterceptors(DurationInterceptor)
  async p2(@Context() context, @Info() info, @Parent() parent: any) {
    return Gql.getFromCache(context, 'Person', false, parent.p2_id, '_id');
  }
}

@Module({
  imports: [
    AuthModule,
    TypeOrmModule.forRoot(SqlConfig.getTypeOrmConfig()),
    getGraphQLModule(isFromWeb).forRoot({
      debug: false,
      playground: true,
      typePaths,
      path,
      context: ({ req }) => ({ req }),
    }),
  ],
  providers: [
    SqlService,
    PersonResolver,
    OrganizationResolver,
    AffiliationResolver,
    RelationResolver,
  ],
})
export class GqlModule {
  constructor() {
    logger.log('GqlModule has been created');
  }

  onModuleInit() {
    logger.log(`GqlModule has been initialized`);
  }
}

export function getModule() { return GqlModule; }
