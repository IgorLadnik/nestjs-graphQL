export interface ISqlTransaction {
  beginTransaction(): Promise<any>;
  endTransaction(args: any);
}

