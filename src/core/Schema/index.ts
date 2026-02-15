import Model from "../../model"
import XqlIDField from "../../xt/fields/IDField"

abstract class Schema<S extends Record<string, any> = any> {
   abstract schema(): S
   private _talbe: string = ''
   private _IDColumn: string = ''
   model: Model<any, any> = null as any

   get table() {
      if (this._talbe) return this._talbe
      let name = this.constructor.name.split(/(?=[A-Z])/)
         .filter(l => l.toLowerCase() !== 'schema')
         .join("_").toLowerCase()
      this._talbe = name.endsWith("y") ? name.slice(0, -1) + "ies" : name + "s"
      return this._talbe
   }

   get IDColumn() {
      if (this._IDColumn) return this._IDColumn
      const shape = this.schema()
      const IDColumn = Object.keys(shape).find(key => shape[key] instanceof XqlIDField)
      if (!IDColumn) throw new Error(`ID Column not found in schema ${this.table}`)
      this._IDColumn = IDColumn
      return this._IDColumn
   }

}

export default Schema