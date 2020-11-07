import { GraphQLModule } from '@nestjs/graphql';
import { GraphQLModuleEx } from './graphql-module-ex';

export { GraphQLModuleEx } from './graphql-module-ex';
export { Gql } from './gql';

export const getGraphQLModule = (isFromWeb: boolean) => isFromWeb ? GraphQLModuleEx : GraphQLModule;