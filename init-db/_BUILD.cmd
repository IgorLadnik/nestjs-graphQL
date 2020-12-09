rem Copy TypeORM entities to the service directory
rmdir /q /s .\src\sql
mkdir .\src\sql
mkdir .\src\sql\entities
xcopy ..\typeorm-entities\*entity.* .\src\sql\entities\* /y

rem Buld
nest build



