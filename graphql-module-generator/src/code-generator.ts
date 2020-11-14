import { parse } from 'graphql';
import * as utils from './utils';
import { Resolver, ResolverFieldEntry, ResolverMutationEntry, ResolverQueryEntry } from './entries';

export class GqlResolversGenerator {
    schemaTree: any[];
    generatedCode: string;

    constructor(private strSchema: string) {
        this.parse();
        this.gen();
    }

    private parse() {
        const schemaParsed: any = parse(this.strSchema);
        const parsedItems = [];
        for (let item of schemaParsed.definitions) {
            const parsedItem = {
                name: item?.name.value,
                kind: item?.kind,
                fields: this.parseFields(item.fields)
            };

            parsedItems.push(parsedItem);
        }

        this.schemaTree = parsedItems;
    }

    private parseFields(fields: any[]) {
        const parsedFields = [];
        for (let i = 0; i < fields?.length; i++) {
            const field = fields[i];
            const types: string[] = [];
            this.parseType(types, field.type);
            const fieldArguments: any[] = this.parseFields(field?.arguments);
            const parsedField = {
                name: field.name?.value,
                kind: field?.kind,
                types,
                arguments: fieldArguments,
                directives: field.directives
            };
            parsedFields.push(parsedField);
        }

        return parsedFields;
    }

    private parseType(types: string[], type: any) {
        types.push(type.kind);
        if (type.name) {
            types.push(type.name.value)
            return;
        }

        this.parseType(types, type.type);
    }

    private gen() {
        let resolverCandidates: string[] = [];
        const queryItem = utils.getQueryItem(this.schemaTree);
        const mutationItem = utils.getMutationItem(this.schemaTree);

        for (let s of queryItem.fields.map((field: any) => field.types[field.types.length - 1]))
            resolverCandidates.push(s);

        resolverCandidates = resolverCandidates.filter(utils.onlyUnique);

        let addResolverCandidates: string[] = [];
        for (let str of resolverCandidates) {
            const item = this.schemaTree.filter(item => item.name === str)?.[0];
            const typeNames = item?.fields.map((field: any) => utils.getTrueType(field));
            for (let s of typeNames.filter((tn: string) => !utils.isScalarType(tn)))
                addResolverCandidates.push(s);
        }

        const resolverNames = resolverCandidates.concat(addResolverCandidates).filter(utils.onlyUnique);

        //===============================================
        const resolvers = new Array<Resolver>();
        for (let resolverName of resolverNames) {
            const item = this.schemaTree.filter(item => item.name === resolverName)[0];
            const resolver = new Resolver(item.name);

            const queries = queryItem.fields.filter((field: any) => utils.getTrueType(field) === item.name);
            for (let query of queries)
                resolver.addEntry(new ResolverQueryEntry(query));

            if (mutationItem?.fields[0]?.arguments?.some((arg: any) => utils.getTrueType(arg) === `${item.name}Input`))
                resolver.addEntry(new ResolverMutationEntry(mutationItem.fields[0]));

            for (let field of item.fields)
                if (!utils.isScalarField(field) || utils.isListField(field))
                    resolver.addEntry(new ResolverFieldEntry(field), resolverName);

            resolvers.push(resolver);
        }

        for (let resolver of resolvers)
            resolver.genCode();

        this.generatedCode = Resolver.endGen(resolverNames);
    }
}

