import { XVArray, XVNullable, XVOptional } from "xanv"
import { XqlField } from "../types";

class XqlArray<T extends XqlField> extends XVArray<T> {
   constructor(type: T) {
      super(type);
   }
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
}

export default XqlArray