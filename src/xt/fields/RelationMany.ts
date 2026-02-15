import Schema from "../../core/Schema"

export type RelationManyInfo = {
   self: {
      table: string
      column: string,
      relation: string,
   }
   target: {
      table: string
      column: string
      relation: string
   },
   sql: string // self table join target table on self.column = target.column
}

class RelationMany<S extends Schema> {
   readonly schema: S
   private _target_column = ''

   readonly type = "relation-many"
   readonly isRelation = true
   info: RelationManyInfo = {
      self: {
         table: '',
         column: '',
         relation: ''
      },
      target: {
         table: '',
         column: '',
         relation: ''
      },
      sql: ''
   }

   constructor(schema: new () => S) {
      this.schema = new schema
   }

   target(column: string) {
      this._target_column = column
      return this
   }

   get column() {
      if (!this._target_column) throw new Error(`target column not found`)
      return this._target_column
   }
}
export default RelationMany
