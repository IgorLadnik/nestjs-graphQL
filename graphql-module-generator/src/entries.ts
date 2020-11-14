import * as utils from './utils';

export const NL = '\r\n';
export const T = '  ';
export const suffixResolverClass = 'Resolver';
export const ReplaceToken = '/*ReplaceToken*/';

const useGuard = `${T}@UseGuards(GqlAuthGuard, TlsGuard)${NL}`;
const useDurationInterceptor = `${T}@UseInterceptors(DurationInterceptor)${NL}`;
const useUserValidationInterceptor = `${T}@UseInterceptors(new ExecutionContextValidationInterceptor(new BaseExecutionContextValidator()))${NL}`;

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
            `${T}// Args:   ${fr.argsRealType}${NL}` +
            `${T}// Return: ${this.entry.types}${NL}` +
            `${T}@Query()${NL}` +
            useGuard +
            useDurationInterceptor +
            useUserValidationInterceptor +
            `${T}async ${this.entry.name}(@Context() context, @Info() info${yy}${fr.args}) {${NL}` +
            `${T}${T}return await Gql.processQuery(this.service, context, info, \'${theType}\', ...); //@@${NL}` +
            `${T}}${NL}` +
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
            `${T}// Args:   ${fr.argsRealType}${NL}` +
            `${T}// Return: ${this.entry.types}${NL}` +
            `${T}@Mutation()${NL}` +
            useGuard +
            useDurationInterceptor +
            useUserValidationInterceptor +
            `${T}async ${this.entry.name}(${fr.args}): Promise<string> {${NL}` +
            `${NL}` +
            `${T}${T}return '';  //@@${NL}` +
            `${T}}${NL}` +
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
        const argsRealType = fr.argsRealType.replace(/, {/g, `,${NL}${T}//         {`);
        const theType = this.entry.types[this.entry.types.length - 1];
        types.push(theType);
        const innerCode =
            `${NL}` +
            `${T}// Args:   ${argsRealType}${NL}` +
            `${T}// Return: ${this.entry.types}${NL}` +
            `${T}@ResolveField('${this.entry.name}')${NL}` +
            useDurationInterceptor +
            `${T}async ${this.entry.name}(@Context() context, @Info() info, @Parent() parent: any${args}) {${NL}` +
            `${T}${T}return Gql.getFromCache(context, \'${theType}\', ${this.isArray}, ..., ...); //@@${NL}` +
            `${T}}${NL}` +
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
                const method = `${T}${methodName} = async (info, ${collection}) =>${NL}` +
                    `${T}${T}await Gql.processField(info, ${collection}, ${entryEx.type}, this.connection,${NL}` +
                    `${T}${T}${T}\'FROM ... WHERE ... IN ...\');  //@@`;
                serviceMethods.push(method);
            }
        }
    }

    genCode() {
        code +=
            `@Resolver('${this.name}')${NL}` +
            `export class ${this.name}${suffixResolverClass} {${NL}` +
            `${T}constructor(private service: SqlService) { }${NL}` +
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
            `${T}process.chdir(__dirname);${NL}` +
            `${NL}` +

            'import { Module, UseInterceptors, UseGuards, Injectable } from \'../../node_modules/@nestjs/common\';' + `${NL}` +
            'import {' + `${NL}` +
            '  Resolver,'  + `${NL}` +
            '  Query,' + `${NL}` +
            '  Mutation,' + `${NL}` +
            '  Args,' + `${NL}` +
            '  ResolveField,'  + `${NL}` +
            '  Parent,' + `${NL}` +
            '  Context,' + `${NL}` +
            '  Info,' + `${NL}` +
            '} from \'../../node_modules/@nestjs/graphql\';' + `${NL}` +
            'import { ConfigService } from \'../../node_modules/config-lib\';' + `${NL}` +
            'import { logger } from \'../../node_modules/logger-lib\';' + `${NL}` +
            'import { AuthModule, GqlAuthGuard } from \'../../node_modules/auth-lib\';' + `${NL}` +
            'import { DirHolder } from \'../../node_modules/module-loader-lib\';' + `${NL}` +
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

            'if (isFromWeb)' + `${NL}` +
            `${T}process.chdir(DirHolder.getProjectDir());${NL}` +
            'else {' + `${NL}` +
            `${T}const configService = new ConfigService();${NL}` +
            `${T}const urlJoin = require(\'url-join\');${NL}` +
            `${T}typePaths = [urlJoin(configService.get(\'GQL_URL\'), configService.get(\'GQL_SCHEMA\'))];${NL}` +
            `${T}path = configService.get(\'GQL_PATH\');${NL}` +
            '}' +
            `${NL}${NL}` +

            'const { getGraphQLModule } = require(isFromWeb ? \`./node_modules/gql-module-lib\` : \'gql-module-lib\');'
            + `${NL}${NL}` +

            '///////////////////////////////////////////////////////////////////////////////////////////////////////' +
            `${NL}${NL}` +
            '@Injectable()' + `${NL}` +
            'class SqlService extends SqlTransaction {' + `${NL}`;

        uniqueComplexTypes.forEach(t => head += `  repo${t};${NL}`);
        head += `${NL}` +
            `${T}constructor(connection: Connection) {${NL}` +
            `${T}${T}super(connection);${NL}${NL}`;
        uniqueComplexTypes.forEach(t => head +=
            `${T}${T}this.repo${t} = this.connection.getRepository(${t});${NL}`);
        head += `${T}}${NL}${NL}` +
            `${T}// Fields  - from database${NL}${NL}`;

        serviceMethods?.forEach(m => head += m + `${NL}${NL}`);
        head += `}${NL}${NL}`;

        const tail =
            '@Module({' + `${NL}` +
            `${T}imports: [` + `${NL}` +
            `${T}${T}AuthModule,` + `${NL}` +
            `${T}${T}TypeOrmModule.forRoot(SqlConfig.getTypeOrmConfig()),${NL}` +
            `${T}${T}getGraphQLModule(isFromWeb).forRoot({${NL}` +
            `${T}${T}${T}debug: false,${NL}` +
            `${T}${T}${T}playground: true,${NL}` +
            `${T}${T}${T}typePaths,${NL}` +
            `${T}${T}${T}path,${NL}` +
            `${T}${T}${T}context: ({ req }) => ({ req }),${NL}` +
            `${T}${T}}),${NL}` +
            `${T}],${NL}` +
            `${T}providers: [${NL}${T}SqlService,${NL}${T}${ReplaceToken}${NL}` +
            '})' + `${NL}` +
            'export class GqlModule {' + `${NL}` +
            `${T}constructor() {${NL}` +
            `${T}${T}logger.log(\'GqlModule has been created\');${NL}` +
            `${T}}${NL}` +
            `${NL}` +
            `${T}onModuleInit() {${NL}` +
            `${T}${T}logger.log(\'GqlModule has been initialized\');${NL}` +
            `${T}}${NL}` +
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

