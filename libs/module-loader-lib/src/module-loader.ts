import fetch from 'node-fetch';
import { ConfigService } from 'config-lib';
const Module = require('module');
const urlJoin = require('url-join');
const path = require('path');
import { logger } from 'logger-lib';
import { DirHolder } from './dir-holder';

export class ModuleLoader {
  readonly configService: ConfigService;

  constructor(subdir: string) {
    DirHolder.setModulesDir(path.join(process.cwd(), subdir).replace(/\\/g, '/'));
    DirHolder.setProjectDir(process.cwd().replace(/\\/g, '/'));

    this.configService = new ConfigService();
  }

  loadModule = (moduleFileName: string) =>
    require(path.join(DirHolder.getModulesDir(), `${moduleFileName}.js`));

  async loadCodeFromWeb(moduleFileName: string): Promise<any> {
    const url = urlJoin(this.configService.get('GQL_URL'), `${moduleFileName}.js`);
    let script;
    try {
      script = await fetch(url);
    }
    catch (err) {
      const msg = `Error in importModule(): ${err}`;
      logger.error(msg);
      return msg;
    }

    if (!script.ok) {
      logger.error(`Error in fetching module from  \"${url}\"`);
      return 'Error in importModule(): wrong script';
    }

    const m = new Module();

    try {
      m._compile(this.setValuesInModule(await script.text()), '');
    }
    catch (err) {
      logger.error(
        `Error in compiling module fetched from \"${url}\": ${err}, stack: ${err.stack}`,
      );
    }

    return m;
  }

  loadExportsFromWeb = async (moduleFileName: string): Promise<any> =>
    (await this.loadCodeFromWeb(moduleFileName)).exports;

  loadModuleFromWeb = async (moduleFileName: string): Promise<any> =>
    (await this.loadExportsFromWeb(moduleFileName)).getModule();

  private setValuesInModule = (code: string): string =>
    code
      .replace('const isFromWeb = false;', `const isFromWeb = true;`)
      .replace("__dirname = ''", `__dirname = \'${DirHolder.getModulesDir()}\'`)
      .replace(
        'let typePaths = []',
        `const typePaths = [\'${urlJoin(
          this.configService.get('GQL_URL'),
          this.configService.get('GQL_SCHEMA')
        )}\']`,
      )
      .replace(
        "let path = ''",
        `const path = \'${this.configService.get('GQL_PATH')}\'`,
      );
}
