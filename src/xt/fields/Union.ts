import { XqlFields } from "@xansql/core";
import { XVUnion } from "xanv"

class XqlUnion<T extends XqlFields[]> extends XVUnion<any> {
   constructor(types: T) {
      super(types as any)
   }
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

export default XqlUnion