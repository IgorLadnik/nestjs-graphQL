import * as fs from 'fs';
import { codegen } from '@graphql-codegen/core';
import { parse, buildSchema, GraphQLSchema, GraphQLResolveInfo } from 'graphql';
import * as typescriptPlugin from '@graphql-codegen/typescript';
import { GqlResolversGenerator } from './code-generator';

(async function main() {
    const SCHEMA = '../file-server/gql/schema.gql';
    const strSchema = fs.readFileSync(SCHEMA, { encoding: 'utf8', flag: 'r' });

    //=========================================

    const schema = buildSchema(strSchema);
    const config = {
        // used by a plugin internally, although the 'typescript' plugin currently
        // returns the string output, rather than writing to a file
        filename: 'schema.ts',
        schema: parse(strSchema),
        plugins: [ // Each plugin should be an object
            {
                typescript: { }, // Here you can pass configuration to the plugin
            },
        ],
        pluginMap: {
            typescript: typescriptPlugin,
            typescript_resolvers: typescriptPlugin,
        },
        documents: [],
        config: {
            //[key: string]: any;
        },
        skipDocumentsValidation: true
    };

    try {
        const tsCode = await codegen(config);
        fs.writeFileSync('../schema.ts', tsCode, { encoding: 'utf8', flag: 'w' });
    }
    catch (err) {
        console.log(`ERROR in \"codegen\": ${err}`);
    }

    //=========================================

    const codeModuleGen = new GqlResolversGenerator(strSchema);
    console.log('\n\r* parsedSchema **************************************');
    console.log(JSON.stringify(codeModuleGen.schemaTree, null, 4));

    console.log('\n\r* GENERATED CODE *************************************');
    console.log(codeModuleGen.generatedCode);

    fs.writeFileSync('../generated-gql.module.ts', codeModuleGen.generatedCode, { encoding: 'utf8', flag: 'w' });


})();
