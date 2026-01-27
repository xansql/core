import { XVObject } from "xanv"
import { XVObjectShape } from "xanv/types/Object";

class XqlObject<const T extends XVObjectShape> extends XVObject<T> {
   optional() {
      throw new Error("optional not supported");
      return super.optional()
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