import { XVDate, XVOptional } from "xanv"
import { XansqlDialectEngine } from "../../core/types"
import XqlFieldInfo from "../XqlFieldInfo"

class XqlDate extends XVDate {
   table!: string
   column_name!: string
   engine!: XansqlDialectEngine

   get info(): XqlFieldInfo {
      return new XqlFieldInfo(this)
   }

   optional(): any {
      throw new Error("optional not supported");
   }
   nullable() {
      super.optional()
      return super.nullable();
   }

   index() {
      return this.set("index", () => { }, true)
   }

   unique() {
      return this.set("unique", () => { }, true)
   }

   update(): XVOptional<this> & { meta: { update: true } } {
      return this.set("update", () => { }, true).default(() => new Date()) as any
   }

   create(): XVOptional<this> & { meta: { create: true } } {
      return this.index().default(() => new Date()).set("create", () => { }, true) as any
   }
}

export default XqlDate