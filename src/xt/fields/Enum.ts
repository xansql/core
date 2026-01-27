import { XVEnum } from "xanv"

class XqlEnum<const T extends string | number> extends XVEnum<T> {
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

export default XqlEnum