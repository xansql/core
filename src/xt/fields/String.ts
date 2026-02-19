import { XVString } from "xanv"
import { XansqlDialectEngine } from "../../core/types"
import XqlFieldInfo from "../XqlFieldInfo"

class XqlString extends XVString {
   table!: string
   column_name!: string
   engine!: XansqlDialectEngine

   get info(): XqlFieldInfo {
      return new XqlFieldInfo(this)
   }

   optional(): any {
      throw new Error("optional not supported")
   }
   nullable() {
      super.optional()
      return super.nullable();
   }
   index() {
      return this.set("index", () => { }, true)
   }

   text() {
      return this.set("text", () => { }, true)
   }

   unique() {
      return this.set("unique", () => { }, true)
   }

   email(): this {
      this.index()
      return super.email()
   }
}

export default XqlString