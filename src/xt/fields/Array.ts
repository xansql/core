import { XVArray } from "xanv"
import { XqlField } from "../types";

class XqlArray<T extends XqlField> extends XVArray<T> {
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