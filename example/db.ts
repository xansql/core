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
         age: xt.number().nullable(),
         email: xt.string().email().unique().nullable(),
         create_at: xt.date().createAt(),
         update_at: xt.date().updateAt(),
         products: xt.many(ProductModel, 'user'),
         customer: xt.one(UserModel, 'customers').nullable(),
         // customers: xt.many(UserModel, 'customer'),
         // metas: xt.many(UserMetaModel, 'user'),
      }
   }
}

class UserMetaModel extends Model {
   schema() {
      return {
         id: xt.id(),
         key: xt.string(),
         value: xt.string(),
         user: xt.one(UserModel, "metas")
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
         user: xt.one(UserModel, 'products'),
         metas: xt.many(ProductMetaModel, 'product'),
         categories: xt.many(ProductCategoryModel, 'product'),
      }
   }
}

class ProductMetaModel extends Model {
   schema() {
      return {
         id: xt.id(),
         key: xt.string(),
         value: xt.string(),
         product: xt.one(ProductModel, "metas")
      }
   }
}

class ProductCategoryModel extends Model {
   schema() {
      return {
         id: xt.id(),
         name: xt.string(),
         value: xt.string(),
         product: xt.one(ProductModel, "categories"),
         sub_categories: xt.many(ProductSubCategoryModel, "category")
      }
   }
}

class ProductSubCategoryModel extends Model {
   schema() {
      return {
         id: xt.id(),
         name: xt.string(),
         value: xt.string(),
         category: xt.one(ProductCategoryModel, "sub_categories"),
         group: xt.one(ProductSubCategoryGroupModel, "sub_categories").nullable(),
      }
   }
}

class ProductSubCategoryGroupModel extends Model {
   schema() {
      return {
         id: xt.id(),
         name: xt.string(),
         value: xt.string(),
         sub_categories: xt.many(ProductSubCategoryModel, "group")
      }
   }
}

export const User = db.model(UserModel)
export const UserMeta = db.model(UserMetaModel)
export const Product = db.model(ProductModel)
export const ProductMeta = db.model(ProductMetaModel)