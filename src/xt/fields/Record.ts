import { XVRecord } from "xanv"
import { XqlFieldInstance, XqlFields } from "../types";

class XqlRecord<K extends XqlFields, V extends XqlFields> extends XVRecord<XqlFieldInstance<K>, XqlFieldInstance<V>> {
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

export default XqlRecord