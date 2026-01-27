import { XVType, XVUnion } from "xanv"

class XqlUnion<T extends XVType<any>[] = XVType<any>[]> extends XVUnion<T> {
   constructor(types: T) {
      super(types as any)
   }
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

export default XqlUnion