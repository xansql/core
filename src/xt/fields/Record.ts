import { XVType, XVRecord } from "xanv"
import { XansqlDialectEngine } from "../../core/types"
import XqlFieldInfo from "../XqlFieldInfo"

class XqlRecord<K extends XVType<any>, V extends XVType<any>> extends XVRecord<K, V> {
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
}

export default XqlRecord