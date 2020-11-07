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

import { Module, UseInterceptors, UseGuards } from '../../node_modules/@nestjs/common';
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
import { SqlModule } from './sql/sql.module';
import { SqlService } from './sql/sql.service';
import { logger } from '../../node_modules/logger-lib';
import { AuthModule, GqlAuthGuard } from '../../node_modules/auth-lib';
import { DirHolder } from '../../node_modules/module-loader-lib';
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
    return await this.service.allPersons(context, info);
  }

  // Args:   {id: NonNullType,NamedType,String}
  // Return: NamedType,Person
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async personById(@Context() context, @Info() info, @Args('id') id: string) {
    const persons = await this.service.personById(context, info, id);
    return persons && persons.length > 0 ? persons[0] : [];
  }

  // Args:   {surname: NonNullType,NamedType,String}
  // Return: NamedType,Person
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async personsBySurname(@Context() context, @Info() info, @Args('surname') surname: string) {
    return await this.service.personsBySurname(context, info, surname);
  }

  // Args:   {relationQueryArg: NonNullType,ListType,NamedType,RelationQueryArg}
  // Return: ListType,NamedType,Person
  @Query()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async personsByRelation(@Args('relationQueryArg') relationQueryArg: any[]) {

    return []; //@@
  }

  // Args:   {personsInput: NonNullType,ListType,NamedType,PersonInput}
  // Return: NamedType,String
  @Mutation()
  @UseGuards(GqlAuthGuard, TlsGuard)
  @UseInterceptors(DurationInterceptor)
  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))
  async createPersons(@Args('personsInput') personsInput: any[]): Promise<string> {
    logger.log('createPersons()'); //TEST
    return this.service.createPersons(personsInput);
  }

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
    return this.service.affiliationsFromCache(context, info, parent);
  }

  // Args:   {kind: NamedType,String}
  // Return: ListType,NamedType,Relation
  @ResolveField('relations')
  @UseInterceptors(DurationInterceptor)
  async relations(@Context() context, @Info() info,
                  @Parent() parent: any,
                  @Args('kind') kind: any) {
    return this.service.relationsFromCache(context, info, parent);
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
    return await this.service.allOrganizations(context, info);
  }

  // Args:
  // Return: NamedType,Organization
  @ResolveField('parent')
  @UseInterceptors(DurationInterceptor)
  async parent(@Context() context, @Info() info, @Parent() parent: any) {
    logger.log(`parent(), context.reqId = ${context.reqId}`); //TEST
    return this.service.parentFromCache(context, info, parent);
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
    logger.log(`organization(), context.reqId = ${context.reqId}`); //TEST
    return this.service.organizationFromCache(context, info, parent);
  }

  // Args:
  // Return: NamedType,Role
  @ResolveField('role')
  @UseInterceptors(DurationInterceptor)
  async role(@Context() context, @Info() info, @Parent() parent: any) {
    logger.log(`role(), context.reqId = ${context.reqId}`); //TEST
    return this.service.roleFromCache(context, info, parent);
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
    logger.log(`p1(), context.reqId = ${context.reqId}`); //TEST
    return []; //@@
  }

  // Args:
  // Return: NonNullType,NamedType,Person
  @ResolveField('p2')
  @UseInterceptors(DurationInterceptor)
  async p2(@Context() context, @Info() info, @Parent() parent: any) {
    logger.log(`p2(), context.reqId = ${context.reqId}`); //TEST
    return this.service.p2FromCache(context, info, parent);
  }
}

@Module({
  imports: [
    getGraphQLModule(isFromWeb).forRoot({
      debug: false,
      playground: true,
      typePaths,
      path,
      context: ({ req }) => ({ req }),
    }),
    AuthModule,
    SqlModule
  ],
  providers: [
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
