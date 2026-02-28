import Xansql from "../core/Xansql";
import { iof } from "../utils";
import XqlIDField from "../xt/fields/IDField";
import XqlRelationMany from "../xt/fields/RelationMany";
import XqlRelationOne from "../xt/fields/RelationOne";
import { CreateArgs, DeleteArgs, ExactArgs, FindArgs, ModelClass, Normalize, SchemaShape, UpdateArgs, UpsertArgs } from "./types-new";
import XansqlError from "../core/XansqlError";
import BuildWhereArgs from "./Build/WhereArgs";
import BuildSelectArgs from "./Build/SelectArgs";
import BuildFindArgs from "./Build/FindArgs";


abstract class Model<S extends SchemaShape = SchemaShape> {
   abstract schema(): S
   readonly xansql: Xansql
   readonly IDColumn: string
   readonly alias: string

   get table() {
      const name = this.constructor.name.replaceAll("_", "")
      let table = name.split(/(?=[A-Z])/).filter(l => l.toLowerCase() !== 'model').join("_").toLowerCase()
      table = table.endsWith("y") ? table.slice(0, -1) + "ies" : table + "s"
      return table
   }

   constructor(xansql: Xansql) {
      this.xansql = xansql
      const fields = this.schema()

      this.schema = (() => fields).bind(this)
      this.IDColumn = Object.keys(fields).find(column => fields[column] instanceof XqlIDField) || ''
      if (!this.IDColumn) {
         throw new Error(`ID Column not found in schema ${this.table}. Please define an ID column using xt.id() in the schema.`)
      }

      // build model registry in xansql for relations
      xansql.models.set(this.constructor as ModelClass<any>, this as any)
      for (let column in fields) {
         const field = fields[column]
         if (iof(field, XqlRelationMany, XqlRelationOne) && !xansql.models.has(field.model)) {
            xansql.model(field.model)
         }
      }

      const aliases = Array.from(xansql.models.values()).map(m => m.alias)
      const parts = this.table.split(/_|(?=[A-Z])/);
      let alias = parts.map(p => p[0]).join('');
      if (!alias || alias.length < 1) {
         alias = this.table.slice(0, 2);
      }
      alias = alias.toLowerCase();
      let counter = 1;
      while (aliases.includes(alias)) {
         alias = alias + counter;
         counter++;
      }
      this.alias = alias

      let migration_columns = []
      let index_sqls = []
      for (let column in fields) {
         const field = fields[column]

         // check field is valid XqlField
         if (!field.meta || !field.parse) {
            throw new XansqlError({
               code: "INTERNAL_ERROR",
               model: this.constructor.name,
               field: column,
               message: `Invalid field type in model ${this.constructor.name}:${column}`
            })
         }

         field.table = this.table
         field.column_name = column
         field.engine = xansql.dialect.engine

         if (iof(field, XqlRelationMany, XqlRelationOne)) {
            const targetColumn = field.column
            const targetSchema = field.model
            const targetModel = xansql.models.get(targetSchema)
            if (!targetModel) {
               throw new Error(`Target model for relation ${column} in schema ${fields.table} not found. Please define the target schema before defining the relation.`)
            }
            const targetShape = targetModel.schema() as Record<string, any>

            // check if relation target exists
            if (field.type === 'relation-many') {
               if (!targetShape[targetColumn] || targetShape[targetColumn].type !== "relation-one") {
                  throw new Error(`Target column ${targetColumn} for relation ${column} in schema ${fields.table} not found in target schema ${targetModel.table}. Please define the target column in the target schema.`)
               }
            }

            if (field.type == 'relation-one') {
               field.relationInfo = {
                  self: {
                     table: this.table,
                     relation: column,
                     column: column,
                  },
                  target: {
                     table: targetModel.table,
                     relation: targetModel.IDColumn,
                     column: targetColumn,
                  },
                  sql: `${this.table}.${column} = ${targetModel.table}.${targetModel.IDColumn}`
               }
            } else if (field.type == 'relation-many') {
               field.relationInfo = {
                  self: {
                     table: this.table,
                     relation: this.IDColumn,
                     column: column,
                  },
                  target: {
                     table: targetModel.table,
                     relation: targetColumn,
                     column: targetColumn,
                  },
                  sql: `${this.table}.${this.IDColumn} = ${targetModel.table}.${targetColumn}`
               }
            }
         }
         if (!iof(field, XqlRelationMany)) {
            const info = field.info
            migration_columns.push(info.sql.column)
            if (info.sql.create_index) {
               index_sqls.push(info.sql.create_index)
            }
         }
      }

      // migration
      const sql = `CREATE TABLE IF NOT EXISTS ${this.table}(${migration_columns.join(",")})`
      xansql.execute(sql)
      for (let idxql of index_sqls) {
         try {
            xansql.execute(idxql)
         } catch (error) {

         }
      }
   }

   async execute(sql: string) {
      return this.xansql.execute(sql)
   }

   async find<T extends FindArgs<S>>(args: ExactArgs<T, FindArgs<S>>) {
      const build = new BuildFindArgs(args as any, this)
      const results = await build.results()

      return args as any
   }

   create<T extends CreateArgs<S>>(args: ExactArgs<T, CreateArgs<S>>) { }
   update<T extends UpdateArgs<S>>(args: ExactArgs<T, UpdateArgs<S>>) { }
   upsert<T extends UpsertArgs<S>>(args: ExactArgs<T, UpsertArgs<S>>) { }
   delete<T extends DeleteArgs<S>>(args: ExactArgs<T, DeleteArgs<S>>) { }

}

export default Model