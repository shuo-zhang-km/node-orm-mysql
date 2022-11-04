import {
  Pool,
  OkPacket,
  Connection,
  PoolOptions,
  QueryOptions,
  RowDataPacket,
  ConnectionOptions
} from 'mysql2';

import {
  Connection as PromiseConnection,
} from 'mysql2/promise';

export type Clients = {
  [key: string]: Connection
}

export type ConditionValueType = null | string | number | boolean | Date | Array<string | number | boolean | Date> | Query;

export type OptType = '=' | '!=' | '>' | '<' | '>=' | '<=' | 'LIKE'
  | 'NOT LIKE' | 'IN' | 'NOT IN' | 'BETWEEN' | 'NOT BETWEEN' | 'IS' | 'IS NOT' | 'REGEXP' | 'NOT REGEXP'
  | 'AND' | 'OR' | 'GROUP' | 'like' | 'not like' | 'in' | 'not in' | 'between' | 'not between' | 'is' | 'is not' | 'regexp' | 'not regexp' | 'group';

export interface WhereOptions {
  key: string | null;
  opt: OptType;
  value: ConditionValueType | WhereOptions[];
}

export interface OrderByOptions {
  sortField: string,
  sortOrder: 'asc' | 'desc'
}

export type OperatorType = 'select' | 'find' | 'insert' | 'update' | 'delete' | 'count';

export interface JoinOption {
  table: string | Query;
  table_alias?: string;
  self_column: string;
  foreign_column: string;
  join_type?: 'left' | 'right' | 'inner';
}

export interface TableOption {
  tableName: string;
  alias: string | null;
}

export interface QueryOperatorOptions {
  conditions: WhereOptions[];
  attrs?: string[] | null;
  orders: OrderByOptions[];
  pageLimit?: number;
  pageOffset?: number;
  tables: TableOption[];
  operator: OperatorType | null;
  data: any | null;
  groupField: string[];
  joins: JoinOption[];
  having: WhereOptions[];
  suffix?: string | null;
  transaction: boolean;
}

export declare class Query {
  constructor(operator?: OperatorType);

  table(tableName: string, alias: string | null): this;

  limit(limit: number): this;

  offset(offset: number): this;

  where(key: string | null, value: ConditionValueType | WhereOptions[], opt?: OptType): this;

  whereObject(obj: Record<string, ConditionValueType>): this;

  whereConditions(...condition: WhereOptions[]): this;

  orWhere(key: string | null, opt: OptType, value: ConditionValueType | WhereOptions[]): this;

  andWhere(key: string | null, opt: OptType, value: ConditionValueType | WhereOptions[]): this;

  attr(...attr: string[]): this;

  orderBy(sortField: string, sortOrder: 'asc' | 'desc'): this;

  groupBy(...groupField: string[]): this;

  having(key: string | null, opt: OptType, value: ConditionValueType | WhereOptions[]): this;

  page(limit: number, offset?: number): this;

  set(data: any): this;

  join(opt: JoinOption): this;
}

export type QueryResult = any | undefined | RowDataPacket[] | RowDataPacket | OkPacket;

export declare class QueryOperator extends Query {
  conn: Connection;
  options: QueryOperatorOptions

  constructor(conn: Connection);

  buildSql(operator: OperatorType): { sql: string, values: any[] };

  exec(): Promise<QueryResult>;

  select<T>(): Promise<T[]>;

  find<T>(): Promise<T>;

  update(data?: any): Promise<OkPacket>;

  insert(data?: any): Promise<OkPacket>;

  count(): Promise<number>;

  /**
   * delete data
   * @param id 
   * @param index_field_name default is 'id'
   */
  delete(id?: number, index_field_name?: string): Promise<OkPacket>;
}

export declare class QueryHandler {
  conn: Connection;

  constructor(conn: Connection);

  table(table: string, alias?: string | null): QueryOperator;

  query(options: QueryOptions): Promise<any>;

  upsert(tableName: string, data: any, condition: Record<string, ConditionValueType>): Promise<OkPacket>;
}

export declare class TransactionOperator extends QueryOperator {
  append(suffix: string): this;
}

export declare class TransactionHandler {
  constructor(conn: PromiseConnection, options?: {
    level: 'READ UNCOMMITTED' | 'RU'
    | 'READ COMMITTED' | 'RC'
    | 'REPEATABLE READ' | 'RR'
    | 'SERIALIZABLE' | 'S'
  });

  query(options: QueryOptions): Promise<any>;

  execute(sql: string, values: any[]): Promise<any>;

  lastInsertId(alias?: string): Promise<number>;

  table(table: string, alias?: string | null): TransactionOperator;

  begin(): Promise<void>;

  commit(): Promise<void>;

  rollback(): Promise<void>;

  upsert(tableName: string, data: any, condition: Record<string, ConditionValueType>): Promise<OkPacket>;
}

export function createClient(options: ConnectionOptions, name?: string | null | undefined): Connection;

export function getClient(name: string): Connection;

export function createPool(options: PoolOptions, name?: string | null | undefined): Pool;

export function createPromiseClient(options: ConnectionOptions, name?: string | null | undefined): PromiseConnection;

export declare class Hook {
  static pre: (
    callback: (options: QueryOperatorOptions) => void,
    option: { table?: string, opt?: OperatorType }
  ) => string;

  static post: (
    callback: (options: QueryOperatorOptions, result: QueryResult | Error) => void,
    option: { table?: string, opt?: OperatorType }
  ) => string;
}
