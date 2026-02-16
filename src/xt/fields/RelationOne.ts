import Schema, { SchemaClass } from "../../core/Schema"


export type RelationOneInfo = {
   self: {
      table: string
      column: string
      relation: string
   }
   target: {
      table: string
      column: string
      relation: string
   },
   sql: string // self table join target table on self.column = target.column
}


class RelationOne<S extends Schema> {
   readonly schema: SchemaClass<S>
   private _target_column = ''

   readonly type = "relation-one"
   readonly isRelation = true

   info: RelationOneInfo = {
      self: {
         table: '',
         column: '',
         relation: '',
      },
      target: {
         table: '',
         column: '',
         relation: ''
      },
      sql: ''
   }

   constructor(schema: SchemaClass<S>) {
      this.schema = schema
   }

   target(column: string) {
      if (this._target_column) throw new Error(`target column already assigned`);
      this._target_column = column
      return this
   }

   get column() {
      if (!this._target_column) throw new Error(`target column not found`)
      return this._target_column
   }
}

export default RelationOne
