import { XVNumber } from "xanv"
import { XansqlDialectEngine } from "../../core/types"
import XqlFieldInfo from "../XqlFieldInfo"

class XqlIDField extends XVNumber {
   table!: string
   column_name!: string
   engine!: XansqlDialectEngine

   get info(): XqlFieldInfo {
      return new XqlFieldInfo(this)
   }

   optional(): any {
      throw new Error("Optional not allowed")
   }
   nullable(): any {
      throw new Error("nullable not allowed")
   }
}

export default XqlIDField