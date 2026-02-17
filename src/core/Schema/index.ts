import Model from "../../model"
import XqlIDField from "../../xt/fields/IDField"
import Xansql from "../Xansql"
import Migration from "./Migration";

export type SchemaClass<S extends Schema = Schema> = new (...args: any[]) => S;

abstract class Schema<S extends Record<string, any> = any> {
   abstract schema(): S
   private xansql: Xansql
   readonly table: string
   readonly IDColumn: string = ''
   readonly schemaShape: ReturnType<this["schema"]>
   readonly migration: Migration

   constructor(xansql: Xansql) {
      this.xansql = xansql
      let table = this.constructor.name.split(/(?=[A-Z])/)
         .filter(l => l.toLowerCase() !== 'schema')
         .join("_").toLowerCase()
      this.table = table.endsWith("y") ? table.slice(0, -1) + "ies" : table + "s"

      const shape = this.schema() as ReturnType<this["schema"]>
      this.schemaShape = shape
      this.IDColumn = Object.keys(shape).find(column => shape[column] instanceof XqlIDField) || ''
      if (!this.IDColumn) {
         throw new Error(`ID Column not found in schema ${this.table}. Please define an ID column using xt.id() in the schema.`)
      }

      xansql.models.set(this.constructor as SchemaClass, this)
      for (let column in shape) {
         const field = shape[column] as any
         if (field.isRelation && !xansql.models.has(field.schema)) {
            xansql.model(field.schema)
         }
      }

      this.migration = new Migration(xansql, this)

      for (let column in shape) {
         const field = shape[column] as any
         if (field.isRelation) {
            const targetColumn = field.column
            const targetSchema = field.schema
            const targetModel = xansql.models.get(targetSchema)
            if (!targetModel) {
               throw new Error(`Target model for relation ${column} in schema ${shape.table} not found. Please define the target schema before defining the relation.`)
            }
            const targetShape = targetModel.schemaShape

            // check if relation target exists
            if (field.type === 'relation-many') {
               if (!targetShape[targetColumn] || targetShape[targetColumn].type !== "relation-one") {
                  throw new Error(`Target column ${targetColumn} for relation ${column} in schema ${shape.table} not found in target schema ${targetSchema.table}. Please define the target column in the target schema.`)
               }
            }

            if (field.type == 'relation-one') {
               field.info = {
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
               field.info = {
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
      return this.xansql.dialect.execute(sql, this.xansql)
   }

   find(where: Partial<S>) { }

}

export default Schema