import { XVNumber } from "xanv"

class XqlNumber extends XVNumber {
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

export default XqlNumber