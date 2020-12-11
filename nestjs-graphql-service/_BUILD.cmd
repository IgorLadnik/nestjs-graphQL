rem Copy TypeORM entities to the service directory
rmdir /q /s .\src\sql
mkdir .\src\sql
mkdir .\src\sql\entities
xcopy ..\typeorm-entities\*entity.* .\src\sql\entities\* /y

rem Build
cmd /c nest build

rem Copy GraphQL schema and module to a file-server working directory
rmdir /q /s ..\file-server\gql
mkdir ..\file-server\gql
xcopy .\dist\modules\gql.module.js ..\file-server\gql\* /y
xcopy .\gql\schema.gql ..\file-server\gql\* /y

rem Replace file requestPipeline.js with its modified version to enable response hooking
xcopy .\src\requestPipeline.js  ..\libs\gql-module-lib\node_modules\apollo-server-express\node_modules\apollo-server-core\dist\* /y






