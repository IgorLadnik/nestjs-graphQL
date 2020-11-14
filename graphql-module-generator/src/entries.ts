import * as utils from './utils';

export const NL = '\r\n';
export const T = '\t';
export const suffixResolverClass = 'Resolver';
export const ReplaceToken = '/*ReplaceToken*/';

const useGuard = `  @UseGuards(GqlAuthGuard, TlsGuard)${NL}`;
const useDurationInterceptor = `  @UseInterceptors(DurationInterceptor)${NL}`;
const useUserValidationInterceptor = `  @UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))${NL}`;

let code = '';

export interface IResolverEntry {
    genCode(parent: string): void;
}

const types = new Array<string>();

const serviceMethods = new Array<string>();

const getUniqueComplexTypes = (argTypes: string[]) =>
    argTypes.filter(utils.onlyUnique).filter(t =>
        t != 'String' && t != 'Boolean' && t != 'Int' && t != 'Float');


export class BaseEntry {
    constructor(protected entry: any) { }

    protected f() {
        let args = '';
        let argsRealType = '';
        for (let arg of this.entry.arguments) {
            const argType = utils.isListField(arg) ? 'any[]' : 'any';
            args += `, @Args('${arg.name}') ${arg.name}: ${argType}`;
            argsRealType += `, {${arg.name}: ${arg.types}}`;
        }

        if (args.length > 2) {
            args = args.slice(2);
            argsRealType = argsRealType.slice(2);
        }

        return { args, argsRealType };
    }
}

export class ResolverQueryEntry extends BaseEntry implements IResolverEntry {
    constructor(entry: any) {
        super(entry);
    }

    genCode(parent: string): void {
        const fr = this.f();
        const yy = fr.args.length === 0 ? '' : ', ';
        const theType = this.entry.types[this.entry.types.length - 1];
        types.push(theType);
        const innerCode =
            `${NL}` +
            `  // Args:   ${fr.argsRealType}${NL}` +
            `  // Return: ${this.entry.types}${NL}` +
            `  @Query()${NL}` +
            useGuard +
            useDurationInterceptor +
            useUserValidationInterceptor +
            `  async ${this.entry.name}(@Context() context, @Info() info${yy}${fr.args}) {${NL}` +
            `    return await Gql.processQuery(this.service, context, info, \'${theType}\', ...); //@@` +`${NL}` +
            `  }${NL}` +
            `${ReplaceToken}`;
        code = code.replace(`${ReplaceToken}`, innerCode);
    }
}

export class ResolverMutationEntry  extends BaseEntry implements IResolverEntry {
    constructor(entry: any) {
        super(entry);
    }

    genCode(parent: string): void {
        const fr = this.f();
        types.push(this.entry.types[this.entry.types.length - 1]);
        const innerCode =
            `${NL}` +
            `  // Args:   ${fr.argsRealType}${NL}` +
            `  // Return: ${this.entry.types}${NL}` +
            `  @Mutation()${NL}` +
            useGuard +
            useDurationInterceptor +
            useUserValidationInterceptor +
            `  async ${this.entry.name}(${fr.args}): Promise<string> {${NL}` +
            `${NL}` +
            `    return '';  //@@${NL}` +
            `  }${NL}` +
            `${ReplaceToken}`;
        code = code.replace(`${ReplaceToken}`, innerCode);
    }
}

export class ResolverFieldEntry extends BaseEntry implements IResolverEntry {
    name: string;
    isArray: boolean;
    type: string;

    constructor(entry: any) {
        super(entry);

        this.name = this.entry.name;
        this.isArray = this.entry.types.includes('ListType');
        this.type = this.entry.types[this.entry.types.length - 1];
    }

    genCode(parent: string): void {
        const fr = this.f();
        const beforeArgs = fr.args === '' ? '' : `, `;
        const args = (beforeArgs + fr.args).replace(/@Args/g, `${NL}${T}${T}${T}@Args`);
        const argsRealType = fr.argsRealType.replace(/, {/g, `,${NL}  //         {`);
        const theType = this.entry.types[this.entry.types.length - 1];
        types.push(theType);
        const innerCode =
            `${NL}` +
            `  // Args:   ${argsRealType}${NL}` +
            `  // Return: ${this.entry.types}${NL}` +
            `  @ResolveField('${this.entry.name}')${NL}` +
            useDurationInterceptor +
            `  async ${this.entry.name}(@Context() context, @Info() info, @Parent() parent: any${args}) {${NL}` +
            `    return Gql.getFromCache(context, \'${theType}\', ${this.isArray}, ..., ...); //@@` +`${NL}` +
            `  }${NL}` +
            `${ReplaceToken}`;
        code = code.replace(`${ReplaceToken}`, innerCode);
    }
}

export class Resolver {
    entries = new Array<IResolverEntry>();

    constructor(private name: string) { }

    addEntry(entry: IResolverEntry, resolverName = '') {
        this.entries.push(entry as IResolverEntry);

        if (resolverName.length > 0) {
            const entryEx = entry as ResolverFieldEntry;
            if (entryEx) {
                const methodName = `${entryEx.name}In${resolverName}`;
                const collection = `${resolverName.toLocaleLowerCase()}s`;
                const method = `  ${methodName} = async (info, ${collection}) =>` + `${NL}` +
                    `    await Gql.processField(info, ${collection}, ${entryEx.type}, this.connection,` +`${NL}` +
                    `      \'FROM ... WHERE ... IN ...\'  //@@`;
                serviceMethods.push(method);
            }
        }
    }

    genCode() {
        code +=
            `@Resolver('${this.name}')${NL}` +
            `export class ${this.name}${suffixResolverClass} {${NL}` +
            `  constructor(private service: SqlService) { }${NL}` +
            `${ReplaceToken}` +
            `}${NL}`;

        for (let entry of this.entries)
            entry.genCode(this.name);

        code = code.replace(`${ReplaceToken}`, '');
        code += `${NL}`;
    }

    static endGen(resolverNames: string[]): string {
        const uniqueComplexTypes = getUniqueComplexTypes(types);
        let head =
            '// Template for this file was automatically generated according to graphQL schema.' + `${NL}` +
            '// The following block is subject to replacement on module runtime upload'  + `${NL}` +
            '// and should be maintained unchanged (including blanks).'  + `${NL}` +
            `${NL}` +
            '// {'  + `${NL}` +
            'const isFromWeb = false;' + `${NL}` +
            'let typePaths = [];' + `${NL}` +
            'let path = \'\';' + `${NL}` +
            '__dirname = \'\';' + `${NL}` +
            '// }'  + `${NL}` +
            `${NL}` +

            'if (isFromWeb)' + `${NL}` +
            '  process.chdir(__dirname);' + `${NL}` +
            `${NL}` +

            'import { Module, UseInterceptors, UseGuards } from \'../../node_modules/@nestjs/common\';' + `${NL}` +
            'import {' + `${NL}` +
            '  Resolver,'  + `${NL}` +
            '  Query,' + `${NL}` +
            '  Mutation' + `${NL}` +
            '  Args,' + `${NL}` +
            '  ResolveField,'  + `${NL}` +
            '  Parent,' + `${NL}` +
            '  Context,' + `${NL}` +
            '  Info,' + `${NL}` +
            '} from \'../../node_modules/@nestjs/graphql\';' + `${NL}` +
            'import { ConfigService } from \'../../node_modules/config-lib\';' + `${NL}` +
            'import { logger } from \'../../node_modules/logger-lib\';' + `${NL}` +
            'import { AuthModule, GqlAuthGuard } from \'../../node_modules/auth-lib\';' + `${NL}` +
            'import { DirHolder } from \'../modules-tools/dir-holder\';' + `${NL}` +
            'import { Gql } from \'../../node_modules/gql-module-lib\';' + `${NL}` +
            'import { SqlTransaction } from \'../../node_modules/sql-base-lib\';' + `${NL}` +
            'import { Connection } from \'../../node_modules/typeorm\';' + `${NL}` +
            'import { TypeOrmModule } from \'../../node_modules/@nestjs/typeorm\';' + `${NL}` +
            'import { SqlConfig } from \'../../node_modules/sql-base-lib\';' + `${NL}` + `${NL}`;

        uniqueComplexTypes.forEach(t => head +=
            `import { ${t} } from \'../sql/entities/${t.toLocaleLowerCase()}.entity\';${NL}`);

        head += `${NL}` +
            'const { ' + `${NL}` +
            '  ExecutionContextValidationInterceptor,' + `${NL}` +
            '  DurationInterceptor,' + `${NL}` +
            '  BaseExecutionContextValidator,' + `${NL}` +
            '  TlsGuard' + `${NL}` +
            '} = require(\'../../node_modules/interceptors-lib\');' + `${NL}` +
            `${NL}` +

            'if (isFromWeb) {' + `${NL}` +
            '  process.chdir(DirHolder.getProjectDir());' + `${NL}` +
            'else {' + `${NL}` +
            '  const configService = new ConfigService();' + `${NL}` +
            '  const urlJoin = require(\'url-join\');' + `${NL}` +
            '  typePaths = [urlJoin(configService.get(\'GQL_URL\'), configService.get(\'GQL_SCHEMA\'))];' + `${NL}` +
            '  path = configService.get(\'GQL_PATH\');' + `${NL}` +
            '}' + `${NL}` +
            `${NL}` +

            'const { getGraphQLModule } = require(isFromWeb ? \`./node_modules/gql-module-lib\` : \'gql-module-lib\');'
            + `${NL}` + `${NL}` +

            '///////////////////////////////////////////////////////////////////////////////////////////////////////' +
            `${NL}` + `${NL}` + `${NL}` +
            '@Injectable()' + `${NL}` +
            'class SqlService extends SqlTransaction {' + `${NL}`;

        uniqueComplexTypes.forEach(t => head += `  repo${t};${NL}`);
        head += `${NL}` +
            '  constructor(connection: Connection) {'+ `${NL}` +
            '    super(connection);' + `${NL}` + `${NL}`;
        uniqueComplexTypes.forEach(t => head +=
            `    this.repo${t} = this.connection.getRepository(${t});${NL}`);
        head += `  }${NL}${NL}` +
            '  // Fields  - from database' + `${NL}` + `${NL}`;

        serviceMethods?.forEach(m => head += m + `${NL}${NL}`);
        head +=  `}${NL}${NL}`;

        const tail =
            '@Module({' + `${NL}` +
            '  imports: [' + `${NL}` +
            '    AuthModule,' + `${NL}` +
            '    TypeOrmModule.forRoot(SqlConfig.getTypeOrmConfig()),' + `${NL}` +
            '    getGraphQLModule(isFromWeb).forRoot({' + `${NL}` +
            '      debug: false,' + `${NL}` +
            '      playground: true,' + `${NL}` +
            '      typePaths,' + `${NL}` +
            '      path,' + `${NL}` +
            '      context: ({ req }) => ({ req }),' + `${NL}` +
            '    }),' + `${NL}` +
            '  ],' + `${NL}` +
            `  providers: [${NL}${T}SqlService,${NL}${T}${ReplaceToken}` + `${NL}` +
            '})' + `${NL}` +
            'export class GqlModule {' + `${NL}` +
            '  constructor() {' + `${NL}` +
            '    logger.log(\'GqlModule has been created\');' + `${NL}` +
            '  }' + `${NL}` +
            `${NL}` +
            '  onModuleInit() {' + `${NL}` +
            '    logger.log(\'GqlModule has been initialized\');' + `${NL}` +
            '  }' + `${NL}` +
            '}' + `${NL}` +
            `${NL}` +
            'export function getModule() { return GqlModule; }' + `${NL}`;

        let str = '';
        for (let s of resolverNames)
            str += s + `${suffixResolverClass},${NL}${T}`;
        str += ']';

        return head +
            code.replace(`${ReplaceToken}`, '') +
            tail.replace(`${ReplaceToken}`, `${str}`);
    }
}

