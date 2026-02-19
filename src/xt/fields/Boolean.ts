import { XVBoolean } from "xanv"
import { XansqlDialectEngine } from "../../core/types";
import XqlFieldInfo from "../XqlFieldInfo";

class XqlBoolean extends XVBoolean {
   table!: string
   column_name!: string
   engine!: XansqlDialectEngine

   get info(): XqlFieldInfo {
      return new XqlFieldInfo(this)
   }

   optional(): any {
      throw new Error("optional not supported");
   }
   nullable(): any {
      throw new Error("nullable not supported");
   }
   index() {
      return this.set("index", () => { }, true)
   }
}

export default XqlBoolean