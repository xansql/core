import { XqlFields } from "@xansql/core";
import { XVTuple } from "xanv"

class XqlTuple<T extends XqlFields[]> extends XVTuple<any> {
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

export default XqlTuple