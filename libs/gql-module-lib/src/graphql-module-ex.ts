import { GraphQLModule } from '@nestjs/graphql';
// console.log(process.cwd());
// console.log(__dirname);
// console.log(`${__dirname}/../src/graphql-types-loader-from-web`);
const { GraphQLTypesLoaderFromWeb } = require(`${__dirname}/../src/graphql-types-loader-from-web`);
const utils = require('@nestjs/graphql/dist/utils');
const gqlConstants = require('@nestjs/graphql/dist/graphql.constants');

export class GraphQLModuleEx extends GraphQLModule {
  constructor(httpAdapterHost, options, graphqlFactory, graphqlTypesLoader, applicationConfig) {
    super(httpAdapterHost, options, graphqlFactory, new GraphQLTypesLoaderFromWeb(), applicationConfig);
  }

  static forRoot(options = {}) {
    options = utils.mergeDefaults(options);
    return {
      module: GraphQLModuleEx,
      providers: [
        {
          provide: gqlConstants.GRAPHQL_MODULE_OPTIONS,
          useValue: options,
        },
      ],
    };
  }
}
