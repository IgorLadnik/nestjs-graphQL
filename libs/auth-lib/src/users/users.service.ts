import { Injectable } from '@nestjs/common';
import { Connection } from 'typeorm';
import { SqlTransaction } from 'sql-base-lib';
import { User } from "./user.entity";

@Injectable()
export class UsersService extends SqlTransaction {
  constructor(connection: Connection) {
    super(connection);
  }

  userByNames = async (userName: string): Promise<User> =>
    (await this.connection.getRepository('User')
      .query(`SELECT * FROM users11 WHERE userName = \'${userName.toLowerCase()}\'`))?.[0];
}
