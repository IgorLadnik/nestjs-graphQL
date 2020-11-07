import { Guid } from 'guid-typescript';
export { IDictionary, Dictionary } from './dictionary';

const _ = require('lodash');

export const orEmpty = obj => (obj ? obj : '');

export const orMinusOne = obj => (obj ? obj : -1);

export function goOneDirUp(dir) {
  const delim = '/';
  const arr = dir.split(delim);
  let newDir = arr[0];
  for (let i = 1; i < arr.length - 1; i++) newDir += `${delim}${arr[i]}`;
  return newDir;
}

export function goNDirsUp(dir, n) {
  let currentDir = dir;
  for (let i = 0; i < n; i++) currentDir = goOneDirUp(currentDir);
  return currentDir;
}

export const delayMs = (duration: number): Promise<void> =>
  new Promise(resolve => setTimeout(() => resolve(), duration));

export const jsonStr = (obj: any, numSpaces = 2): string => JSON.stringify(obj, null, numSpaces);

export const guidStr = (): string => `${Guid.create()}`;

export const notNil = arr => arr.filter(a => a !== undefined && !_.isNil(a));

export const unique = arr => arr.filter(a => a !== undefined && !_.isNil(a));

export function intersection(a, b) {
  const isAok = a && !_.isNil(a) && a.length > 0;
  const isBok = b && !_.isNil(b) && b.length > 0;
  return isAok && isBok ? a.filter(x => b.includes(x)) : [];
}

export function difference(a, b) {
  const isAok = a && !_.isNil(a) && a.length > 0;
  const isBok = b && !_.isNil(b) && b.length > 0;

  if (isAok && isBok)
    return a.filter(x => !b.includes(x));

  if (!isAok && !isBok)
    return undefined;

  return isAok ? a : b;
}

export function merge(a: any[], b: any[]): any[] {
  const isAok = a && !_.isNil(a) && a.length > 0;
  const isBok = b && !_.isNil(b) && b.length > 0;

  if (isAok && isBok)
    return _.uniqBy([...a, ...b], JSON.stringify);

  if (!isAok && !isBok)
    return undefined;

  return isAok ? a : b;
}

export class ServiceInstanceId {
  private static id: string;

  static getId() {
    if (!ServiceInstanceId.id)
      ServiceInstanceId.id = guidStr();

    return ServiceInstanceId.id;
  }
}
