import { logger } from 'logger-lib';
import { Dictionary, merge, notNil } from 'common-utils-lib';
const _ = require('lodash');

const xx = '        database query: ';

export class Gql {
  static async processQuery(service, context, info, cls, fnQuery, fnTransformResponse = undefined) {
    context.cache = new Dictionary<any>();
    context.transformResponse = fnTransformResponse;

    const strSelect = Gql.begin(info, cls);
    let items;
    logger.log(`${xx} ${cls.name}:  ${strSelect}`);
    try {
      items = await fnQuery(strSelect);
    }
    catch (err) {
      logger.error(err);
    }

    Gql.end(items, cls);
    await Gql.dbToCache(service, items, context.cache, info);

    return items;
  }

  static async processField(info, items, cls, connection, queryTemplate) {
    const strSelect = Gql.begin(info, cls);
    const q = Gql.parseSelectQueryTemplate(queryTemplate);
    const arr = await Gql.bringDataFromDb(connection, items, cls, q.in_,
      `SELECT ${strSelect} FROM ${q.table}`, q.where);
    Gql.end(arr, cls);
    return arr;
  }

  // Recursive method
  private static async dbToCache(service, instances: Array<any>, cache, info, maxLevel = -1, level = 0) {
    if (!instances || instances.length === 0)
      return;

    level++;

    //logger.log(`@@-> ${instances[0].typeName}, level = ${level}, instances num. = ${instances.length}`);

    // Check for maxLevel compliance
    if (maxLevel > 0 && level > maxLevel) {
      logger.log(`attempt to exceed max permitted depth = ${maxLevel}`);
      return;
    }

    //logger.log(`recursion depth: ${level}`);

    if (level === 1)
      info = Gql.parseField(info.fieldNodes?.[0])?.fields;

    info = info?.filter(f => f.selectionSet);

    if (!info || info.length === 0)
      return;

    //logger.log(`>>> level = ${newLevel}\n${jsonStr(info)}`);

    for (let complexTypeField of info) {
      const complexType = complexTypeField.name.value;
      const internalFields = complexTypeField.selectionSet.selections;

      //logger.log(`-> ${complexType} ${instances[0].typeName}, level = ${level}, instances num. = ${instances.length}`);
      const dataFetchMethod = Gql.getServiceMethod(service, complexType, instances[0].typeName);
      if (!dataFetchMethod)
        continue;

      let innerTypeInstance;
      try {
        // Fetch data from database
        innerTypeInstance = await dataFetchMethod(internalFields, instances);
      }
      catch (err) {
        logger.error(err);
      }

      if (typeof innerTypeInstance === 'boolean' && innerTypeInstance)
        continue;

      if (innerTypeInstance && innerTypeInstance.length > 0) {
        // Insert fetched data to cache
        const key = innerTypeInstance[0].typeName;
        Gql.toCache(cache, key, merge(Gql.fromCache(cache, key), innerTypeInstance));

        // Recursive call for next level
        await this.dbToCache(service, innerTypeInstance, cache, internalFields, maxLevel, level);
      }
    }
  }

  // Gets service methods to fetch data from DB according to the following
  // naming convention:
  // service.
  //   typeInst(instances),            typeInst's'(instances),
  //   typeInst'In'clsName(instances), typeInst'sIn'clsName(instances)
  // Ex.: affiliationsByPerson(persons), p2(relations)
  private static getServiceMethod(service, typeInst: string, clsName = '') {
    const predefinedMethodNames = [typeInst, `${typeInst}s`, `${typeInst}In${clsName}`, `${typeInst}sIn${clsName}`];
    for (let methodName of predefinedMethodNames) {
      const method = service[methodName];
      if (_.isFunction(method))
        return method;
    }
    return undefined;
  }

  private static parseField(field) {
    const name = field.name.value;
    const fields = field.selectionSet?.selections;
    return { name, fields };
  }

  private static toCache = (cache, key: string, data: any) => {
    const k = key.toLocaleLowerCase();
    const prevData = cache.remove(k);
    let newData = [];
    if (prevData && prevData.length > 0) {
      for (let item of data) {
        let toNew = true;
        for (let prevItem of prevData) {
          if (prevItem._id === data._id) {
            toNew = false
            break;
          }
        }

        if (toNew)
          newData.push(item);
      }
    }
    else
      newData = data;

    cache.put(k, newData);
  }

  private static fromCache = (cache, key: string): any => cache.get(key.toLocaleLowerCase());

  static getFromCache = (context, clsName, isArray, parentId: string, ...itemIds: string[]) =>
    // similar to
    // SELECT * FROM id_clsName WHERE parentId IN [itemIds]
    Gql.fromCacheWithFunc(context, clsName, isArray,
      a => a.filter(item => {
        for (let id of itemIds)
          if (item[id] === parentId)
            return true;
        return false;
      }));

  static fromCacheWithFunc(context, clsName, isArray, func) {
    let result;
    const entities = Gql.fromCache(context.cache, clsName);
    if (entities) {
      try {
        result = func(entities);
      }
      catch (err) {
        logger.error(err);
      }
    }

    if (result && result.length > 0) {
      if (!isArray)
        result = result[0];
    }
    else
      result = null;

    return result;
  }

  private static appendWithType(arr, typeName: string) {
    if (arr && arr.length > 0)
      arr[0].typeName = typeName;
  }

  private static getSelectParams(info) {
    let props = [];
    if (info) {
      const fields = info?.fieldNodes ? info.fieldNodes[0].selectionSet.selections : info;
      props = fields.map(f => f.name.value);
    }
    return props;
  }

  private static saveColumnsNames(columns: string[], instances) {
    if (columns.length === 0)
      Object.keys(instances.columns).forEach(c => columns.push(c));
  }

  private static async bringDataFromDb(connection, arr: any[], cls: any, idName: string,
                        selectFrom: string, whereIdName = '_id'): Promise<any[]> {
    if (!arr || arr.length === 0)
      return;

    const ids = notNil(arr.map(a => a[idName]));
    if (!ids || ids.length === 0)
      return new Array<any>();

    const q = _.uniq(ids).join();
    const queryStr = `${selectFrom} WHERE ${whereIdName} IN (${q})`;
    logger.log(`${xx} ${cls.name}:  ${queryStr}`);
    let result: any[];
    try {
      result = await connection.getRepository(cls).query(queryStr);
    }
    catch (err) {
      logger.error(err);
    }

    return result;
  }

  private static getSelectColumns(select: string[], columns: string[]): string {
    if (!columns || columns.length === 0)
      return '*';

    const updatedColumns = [];
    for (let c of columns) {
      if (c.length - c.lastIndexOf('_id') === '_id'.length) {
        updatedColumns.push(c);
        continue;
      }

      for (let s of select) {
        if (c === s) {
          updatedColumns.push(c);
          break;
        }
      }
    }

    return updatedColumns.length > 0 ? updatedColumns.join() : '*';
  }

  private static parseSelectQueryTemplate(qt) {
    const indexFrom = qt.indexOf('FROM');
    const indexWhere = qt.indexOf('WHERE');
    const indexIn = qt.indexOf('IN');
    const table = qt.substring(indexFrom + 'FROM'.length, indexWhere).replace(' ', '');
    const where = qt.substring(indexWhere + 'WHERE'.length, indexIn).replace(' ', '');
    const in_ = qt.substring(indexIn + 'IN'.length, qt.length).replace(' ', '');
    return { table, where, in_ };
  }

  private static begin(info, cls) {
    const token = `${cls.name.toLowerCase()}s`;
    const select = Gql.getSelectParams(info);
    const columnName = `${token}Columns`;
    if (!Gql[columnName])
      Gql[columnName] = new Array<string>();
    return this.getSelectColumns(select, Gql[columnName]);
  }

  private static end(arr, cls) {
    const token = `${cls.name.toLowerCase()}s`;
    Gql.appendWithType(arr, cls.name);
    Gql.saveColumnsNames(Gql[`${token}Columns`], arr);
  }

  static getLevel(info): number {
    let level = 0;
    let prev = info.path.prev;
    while (prev) {
      level++;
      prev = prev.prev;
    }
    return level;
  }
}
