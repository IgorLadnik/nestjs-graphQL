import * as dotenv from 'dotenv';
import * as fs from 'fs';
import { Injectable } from '@nestjs/common';

@Injectable()
export class ConfigService {
  private readonly pathEnv = '.env';
  private readonly envConfig: { [key: string]: string };

  constructor() {
    this.envConfig = dotenv.parse(fs.readFileSync(this.pathEnv));
  }

  get = (key: string): string => this.envConfig[key];

  getBool = (key: string): boolean => this.get(key)?.toLocaleLowerCase() === 'true';

  getInt = (key: string): number => parseInt(this.get(key));

  getFloat = (key: string) => parseFloat(this.get(key));

  getStringArray(key: string): string[] {
    const str = this.get(key);
    if (!str || str.length === 0)
      return undefined;

    let arr = new Array<string>();
    for (let s of str.split(' '))
      if (s.length > 0)
        arr.push(s);

    return arr;
  }
}
