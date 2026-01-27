import { XVBoolean } from "xanv"

class XqlBoolean extends XVBoolean {
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

export default XqlBoolean