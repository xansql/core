import SqliteDialect from "@xansql/sqlite-dialect";
import { Model, Xansql, xt } from "../src";
import MysqlDialect from "@xansql/mysql-dialect";

const sqlite = SqliteDialect('db.sqlite')


const mysql = MysqlDialect({
   host: "localhost",
   port: 3306,
   user: 'root',
   password: 'root1234',
   database: "xansql",
   // file: {
   //    upload: async (file: File, xansql: Xansql) => {

   //    },
   //    delete: async (fileId: string) => {
   //       const fs = await import('fs');
   //       const path = await import('path');
   //       const filePath = path.join(process.cwd(), dir, fileId);
   //       if (fs.existsSync(filePath)) {
   //          fs.unlinkSync(filePath);
   //       }
   //    }
   // }
})


const db = new Xansql({
   dialect: mysql as any
})


class UserModel extends Model {
   schema() {
      return {
         uid: xt.id(),
         name: xt.string(),
         age: xt.number(),
         email: xt.string().email().unique(),
         products: xt.many(ProductModel).target("user"),
         customer: xt.one(UserModel).target("customers"),
      }
   }
}

class ProductModel extends Model {
   schema() {
      return {
         pid: xt.id(),
         name: xt.string(),
         description: xt.string(),
         status: xt.string(),
         user: xt.one(UserModel).target("products")
      }
   }

   getStudents() {

   }
}

export const User = db.model(UserModel)
export const Product = db.model(ProductModel)