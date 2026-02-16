import Model from "../../model"
import XqlIDField from "../../xt/fields/IDField"
import Xansql from "../Xansql"

export type SchemaClass<S extends Schema = Schema> = new (...args: any[]) => S;

abstract class Schema<S extends Record<string, any> = any> {
   abstract schema(): S
   private xansql: Xansql
   readonly table: string
   readonly IDColumn: string = ''
   readonly schemaShape: ReturnType<this["schema"]>

   constructor(xansql: Xansql) {
      this.xansql = xansql
      let table = this.constructor.name.split(/(?=[A-Z])/)
         .filter(l => l.toLowerCase() !== 'schema')
         .join("_").toLowerCase()
      this.table = table.endsWith("y") ? table.slice(0, -1) + "ies" : table + "s"

      const shape = this.schema() as ReturnType<this["schema"]>
      this.schemaShape = shape

      xansql.models.set(this.constructor as SchemaClass, this)
      for (let column in shape) {
         const field = shape[column] as any
         if (field.isRelation && !xansql.models.has(field.schema)) {
            xansql.model(field.schema)
         }
      }

      for (let column in shape) {
         const field = shape[column] as any
         if (field instanceof XqlIDField) {
            this.IDColumn = column
         }

         // check if relation target exists         
         if (field.isRelation && field.type === "relation-many") {
            const targetColumn = field.column
            const targetSchema = field.schema
            const targetModel = xansql.models.get(targetSchema)
            if (!targetModel) {
               throw new Error(`Target model for relation ${column} in schema ${shape.table} not found. Please define the target schema before defining the relation.`)
            }

            const targetShape = targetModel.schemaShape
            if (!targetShape[targetColumn] || targetShape[targetColumn].type !== "relation-one") {
               throw new Error(`Target column ${targetColumn} for relation ${column} in schema ${shape.table} not found in target schema ${targetSchema.table}. Please define the target column in the target schema.`)
            }
         }

         if (field.isRelation) {
            const targetColumn = field.column
            const targetSchema = field.schema
            const targetModel = xansql.models.get(targetSchema)
            if (!targetModel) {
               throw new Error(`Target model for relation ${column} in schema ${shape.table} not found. Please define the target schema before defining the relation.`)
            }

            const targetShape = targetModel.schemaShape
            console.log(targetModel);


            if (field.type == 'relation-one') {
               field.info = {
                  self: {
                     table: this.table,
                     relation: column,
                     column: column,
                  },
                  target: {
                     table: field.schema.table,
                     relation: field.schema.IDColumn,
                     column: field.column,
                  },
                  sql: `${table}.${column} = ${field.schema.table}.${field.schema.IDColumn}`
               }
            } else if (field.type == 'relation-many') {
               field.info = {
                  self: {
                     table: table,
                     relation: this.IDColumn,
                     column: column,
                  },
                  target: {
                     table: field.schema.table,
                     relation: field.column,
                     column: field.column,
                  },
                  sql: `${table}.${this.IDColumn} = ${field.schema.table}.${field.column}`
               }
            }
         }
      }

      if (!this.IDColumn) {
         throw new Error(`ID Column not found in schema ${this.table}. Please define an ID column using xt.id() in the schema.`)
      }

   }


   find(where: Partial<S>) { }

}

export default Schema