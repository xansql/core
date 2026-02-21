import { XVType } from "xanv"
import Model from "../../model"
import { XansqlDialectEngine } from "../../core/types"
import XqlFieldInfo from "../XqlFieldInfo"
import { ModelClass } from "../../model/types-new"

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

class XqlRelationMany<M extends Model> extends XVType<any> {
   readonly schema!: ReturnType<M['schema']>
   readonly model: ModelClass<M>
   readonly type = "relation-many"
   readonly isRelation = true
   private _target_column = ''

   table!: string
   column_name!: string
   engine!: XansqlDialectEngine

   get info(): XqlFieldInfo {
      return new XqlFieldInfo(this)
   }

   relationInfo: RelationManyInfo = {
      self: {
         table: '',
         column: '',
         relation: '',
      },
      target: {
         table: '',
         column: '',
         relation: '',
      },
      sql: ''
   }

   protected check(value: unknown) { }



   get column() {
      if (!this._target_column) throw new Error(`target column not found`)
      return this._target_column
   }

   constructor(model: ModelClass<M>) {
      super()
      this.model = model
   }
   optional(): any {
      throw new Error("optional not supported");
   }

   nullable(): any {
      throw new Error("nullable not supported");
   }

   target(column: string) {
      if (this._target_column) throw new Error(`target column already assigned`);
      this._target_column = column
      return this
   }
}
export default XqlRelationMany
