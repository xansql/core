import { XVArray, XVType } from "xanv"

class XqlArray<T extends XVType<any>> extends XVArray<T> {

   constructor(type: T) {
      super(type);
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


}

export default XqlArray