import { XVType } from "xanv"
import Schema, { SchemaClass } from "../../core/Schema"

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

class RelationMany<S extends Schema> extends XVType<ReturnType<S["schema"]>> {

   protected check(value: unknown): ReturnType<S["schema"]> {
      if (!this.meta.target) {
         throw new Error("Target column not defined for relation-many field")
      }
      return value as ReturnType<S["schema"]>
   }

   readonly schema: SchemaClass<S>
   readonly type = "relation-many"
   readonly isRelation = true

   constructor(schema: SchemaClass<S>) {
      super()
      this.schema = schema
   }

   target(column: string) {
      this.set("column", column, true)
      return this
   }
}
export default RelationMany
