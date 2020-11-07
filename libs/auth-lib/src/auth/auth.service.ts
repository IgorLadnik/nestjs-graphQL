import { Injectable } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { Connection } from "typeorm";

@Injectable()
export class AuthService {
  private readonly usersService: UsersService;

  constructor(private jwtService: JwtService, connection: Connection) {
    this.usersService = new UsersService(connection);
  }

  async validateUser(userName: string, password: string): Promise<any> {
    const user = await this.usersService.userByNames(userName);
    if (user && user.password === password) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { sub: user.id, permissions: user.permissions };
    return {
      access_token: this.jwtService.sign(payload),
    };
  }
}
