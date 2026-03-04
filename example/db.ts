import SqliteDialect from "@xansql/sqlite-dialect";
import { Model, Xansql, XansqlFileMeta, xt } from "../src";
import MysqlDialect from "@xansql/mysql-dialect";
import { XansqlBridgeDialect } from "@xansql/bridge";
import { ProductMetaModel, ProductModel, UserMetaModel, UserModel } from "./Schema";

// const sqlite = SqliteDialect('db.sqlite')


const mysql = MysqlDialect({
   host: "localhost",
   port: 3306,
   user: 'root',
   password: 'root1234',
   database: "xansql",

})

export const db = new Xansql({
   dialect: mysql as any,
   file: {
      upload: async (chunk: Uint8Array, meta: XansqlFileMeta) => {

      },
      delete: async (fileId: string) => {

      }
   }
})

export const User = db.model(UserModel)
export const UserMeta = db.model(UserMetaModel)
export const Product = db.model(ProductModel)
export const ProductMeta = db.model(ProductMetaModel)