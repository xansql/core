import { XVType } from "xanv";
import Xansql from "../core/Xansql";
import { iof } from "../utils";
import XqlFile from "../xt/fields/File";
import XqlIDField from "../xt/fields/IDField";
import XqlRelationMany from "../xt/fields/RelationMany";
import XqlRelationOne from "../xt/fields/RelationOne";
import { CreateArgs, DeleteArgs, FindArgs, ModelClass, Normalize, SchemaShape, UpdateArgs, UpsertArgs } from "./types-new";
import XansqlError from "../core/XansqlError";

type Narrow<T> =
   | (T extends [] ? [] : never)
   | (T extends object ? { [K in keyof T]: Narrow<T[K]> } : T)


abstract class Model<S extends SchemaShape = SchemaShape> {
   abstract schema(): S
   private xansql: Xansql
   readonly table: string
   readonly IDColumn: string

   constructor(xansql: Xansql) {
      this.xansql = xansql
      const fields = this.schema()
      const name = this.constructor.name
      let table = name.split(/(?=[A-Z])/).filter(l => l.toLowerCase() !== 'model').join("_").toLowerCase()
      this.table = table.endsWith("y") ? table.slice(0, -1) + "ies" : table + "s"
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

      for (let column in fields) {
         const field = fields[column]

         // check field is valid XqlField
         if (!field.meta || !field.info || !field.parse) {
            throw new XansqlError({
               model: this.constructor.name,
               column,
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
      }
   }

   async execute(sql: string) {
      return this.xansql.execute(sql)
   }

   // find(args: FindArgs<S>) { }
   find<T extends FindArgs<S>>(args: T): Normalize<T> {
      return args as any
   }

   create<A extends CreateArgs<S>>(args: A) { }
   update<A extends UpdateArgs<S>>(args: A) { }
   upsert<A extends UpsertArgs<S>>(args: A) { }
   delete<A extends DeleteArgs<S>>(args: A) { }

}

export default Model