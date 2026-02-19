import { XVFile } from "xanv"
import { XansqlDialectEngine } from "../../core/types"
import XqlFieldInfo from "../XqlFieldInfo"

class XqlFile extends XVFile {
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
}

export default XqlFile