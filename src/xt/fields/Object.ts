import { XVObject } from "xanv"
import { XVObjectShape } from "xanv/types/Object";

class XqlObject<O extends XVObjectShape = any> extends XVObject<O> {
   optional() {
      super.optional()
      return super.nullable();
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