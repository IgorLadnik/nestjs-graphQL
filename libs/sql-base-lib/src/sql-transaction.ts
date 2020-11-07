import { ISqlTransaction } from './sql-interfaces';
import { Connection, QueryRunner } from 'typeorm/index';

export class SqlTransaction implements ISqlTransaction {
  constructor(protected connection: Connection) {}

  async beginTransaction(): Promise<QueryRunner> {
    const queryRunner = this.connection.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();
    return queryRunner;
  }

  async endTransaction(args: any) {
    if (args.isOK) {
      await args.queryRunner.commitTransaction();
      args.message += 'SQL transaction committed. ';
    }
    else {
      await args.queryRunner.rollbackTransaction();
      args.message += 'SQL transaction rolled back. ';
    }

    await args.queryRunner.release();
  }
}
