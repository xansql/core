import { XVNumber } from "xanv"

class XqlNumber extends XVNumber {
   optional() {
      super.nullable()
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