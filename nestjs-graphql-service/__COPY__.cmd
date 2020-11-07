xcopy .\graphql-types.loader.js ..\zeebe-nestjs-microservice\node_modules\@nestjs\microservices\context\* /y

xcopy .\rpc-context-creator.js .\node_modules\@nestjs\microservices\context\* /y

xcopy .\dist\modules\gql.module.js ..\file-server\gql\* /y
xcopy .\schema.gql ..\file-server\gql\* /y
xcopy .\requestPipeline.js  ..\libs\gql-module-lib\node_modules\apollo-server-express\node_modules\apollo-server-core\dist\* /y





