import { XVType, XVRecord } from "xanv"

class XqlRecord<K extends XVType<any>, V extends XVType<any>> extends XVRecord<K, V> {
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

export default XqlRecord