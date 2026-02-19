import { XVObject } from "xanv"
import { XVObjectShape } from "xanv/types/Object";
import { XansqlDialectEngine } from "../../core/types";
import XqlFieldInfo from "../XqlFieldInfo";

class XqlObject<const T extends XVObjectShape> extends XVObject<T> {
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

export default XqlObject