import { XVArray, XVType } from "xanv"

class XqlArray<T extends XVType<any>> extends XVArray<T> {
   constructor(type: T) {
      super(type);
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
}

export default XqlArray