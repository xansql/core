import Model from "../model";
import { AggregateArgsType, CreateArgsType, DeleteArgsType, FindArgsType, UpdateArgsType } from "../model/types";
import { XqlSchemaShape, XT } from "../xt/types";
import Xansql from "./Xansql";

export type ModelType = Model<Xansql, string, XqlSchemaShape>;
type NoInfer<T> = [T][T extends any ? 0 : never]
export type ModelCallback<C extends object> = (xt: any) => NoInfer<C>

export type RowObject = {
   [key: string]: any;
}

export type ResultData = RowObject[]

export type ExecuterResult<Row = RowObject> = {
   results: ResultData;
   affectedRows: number;
   insertId: number | null;
}

export type XansqlDialectEngine = 'mysql' | 'postgresql' | 'sqlite'
export type XansqlDialectSchemaColumn = {
   name: string;
   type: string;
   notnull: boolean;
   default_value: any;
   pk: boolean;
   index: boolean;
   unique: boolean;
}
export type XansqlDialectSchemaType = {
   [table: string]: XansqlDialectSchemaColumn[]
}

export type XansqlFileMeta = {
   fileId: string;
   name: string;
   size: number;
   type: string;
   chunkIndex: number;
   totalChunks: number;
   isFinish: boolean;
};

export type XansqlFileConfig = {
   deleteFileOnMigration?: boolean;
   maxFilesize?: number; // in KB
   checkFileType?: boolean;
   chunkSize?: number; // in KB
   upload: (file: File, xansql: Xansql) => Promise<XansqlFileMeta>;
   delete: (fileId: string, xansql: Xansql) => Promise<void>;
}


export type XansqlDialect = {
   execute: (sql: string, xansql: Xansql) => Promise<ExecuterResult | null>;
   getSchema: (xansql: Xansql) => Promise<XansqlDialectSchemaType | void>;
   engine: XansqlDialectEngine;
   file?: XansqlFileConfig
}

export type XansqlSocket = {
   open: (socket: WebSocket) => Promise<void>;
   message: (socket: WebSocket, data: any) => Promise<void>;
   close: (socket: WebSocket) => Promise<void>;
}

export type XansqlCache<Row = object> = {
   cache: (sql: string, model: ModelType) => Promise<Row[] | void>;
   clear: (model: ModelType) => Promise<void>;
   onFind: (sql: string, model: ModelType, data: Row) => Promise<void>;
   onCreate: (model: ModelType, insertId: number) => Promise<void>;
   onUpdate: (model: ModelType, rows: Row[]) => Promise<void>;
   onDelete: (model: ModelType, rows: Row[]) => Promise<void>;
}


export type XansqlHooks = {
   beforeExcute?: (model: ModelType, sql: string) => Promise<string | void>
   afterExcute?: (model: ModelType, result: ExecuterResult) => Promise<ExecuterResult | void>
   beforeFind?: (model: ModelType, args: FindArgsType) => Promise<FindArgsType | void>;
   afterFind?: (model: ModelType, result: ResultData, args: FindArgsType) => Promise<ResultData | void>;
   beforeCreate?: (model: ModelType, args: CreateArgsType) => Promise<CreateArgsType | void>
   afterCreate?: (model: ModelType, result: ResultData, args: CreateArgsType) => Promise<ResultData | void>;
   beforeUpdate?: (model: ModelType, args: UpdateArgsType) => Promise<UpdateArgsType | void>;
   afterUpdate?: (model: ModelType, result: ResultData, args: UpdateArgsType) => Promise<ResultData | void>;
   beforeDelete?: (model: ModelType, args: DeleteArgsType) => Promise<DeleteArgsType | void>;
   afterDelete?: (model: ModelType, result: ResultData, args: DeleteArgsType) => Promise<ResultData | void>;
   beforeAggregate?: (model: ModelType, args: AggregateArgsType) => Promise<AggregateArgsType | void>;
   afterAggregate?: (model: ModelType, result: ResultData, args: AggregateArgsType) => Promise<ResultData | void>;

   transform?: (model: ModelType, row: RowObject) => Promise<RowObject | void>
}

export type XansqlConfigType = {
   dialect: XansqlDialect;
   socket?: XansqlSocket;
   cache?: XansqlCache;
   debug?: boolean;

   maxLimit?: {
      find?: number;
      create?: number;
      update?: number;
      delete?: number;
   },

   hooks?: XansqlHooks
}

export type XansqlConfigTypeRequired = Required<XansqlConfigType> & {
   maxLimit: Required<XansqlConfigType['maxLimit']>;
}