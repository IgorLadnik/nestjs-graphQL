export interface IDictionary<T> {
  put(key: string, value: T): void;
  containsKey(key: string): boolean;
  getCount(): number;
  get(key: string): T;
  keys(): string[];
  remove(key: string): T;
  values(): T[];
}

export class Dictionary<T> implements IDictionary<T> {
  private items: { [index: string]: T } = {};

  public containsKey(key: string): boolean {
    return this.items.hasOwnProperty(key);
  }

  public getCount(): number {
    return this.keys().length;
  }

  public put(key: string, value: T) {
    this.items[key] = value;
  }

  public remove(key: string): T {
    let val = this.items[key];
    delete this.items[key];
    return val;
  }

  public get(key: string): T {
    return this.items[key];
  }

  public keys(): string[] {
    let keySet: string[] = [];

    for (let prop in this.items) {
      if (this.items.hasOwnProperty(prop)) {
        keySet.push(prop);
      }
    }

    return keySet;
  }

  public values(): T[] {
    let values: T[] = [];

    for (let prop in this.items) {
      if (this.items.hasOwnProperty(prop)) {
        values.push(this.items[prop]);
      }
    }

    return values;
  }
}
