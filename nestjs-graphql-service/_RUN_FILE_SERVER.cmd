xcopy .\dist\gql.module.js ..\file-server\gql\* /y
xcopy .\schema.gql ..\file-server\gql\* /y

node ../file-server/static-server.js