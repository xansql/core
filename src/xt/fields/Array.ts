import { XVArray, XVType } from "xanv"
import { XansqlDialectEngine } from "../../core/types";
import XqlFieldInfo from "../XqlFieldInfo";

class XqlArray<T extends XVType<any>> extends XVArray<T> {

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

export default XqlArray