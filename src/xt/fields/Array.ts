import { XqlFields } from "@xansql/core";
import { XVArray } from "xanv"
import { XqlFieldInstance } from "../types";

class XqlArray<T extends XqlFields = XqlFields> extends XVArray<XqlFieldInstance<T>> {
   constructor(type?: T, length?: number) {
      super(type as XqlFieldInstance<T>, length);
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