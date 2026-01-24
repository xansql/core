import { XqlFields } from "@xansql/core";
import { XVType, XVUnion } from "xanv"

class XqlUnion<T extends XVType<any>[] = XVType<any>[]> extends XVUnion<T> {
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