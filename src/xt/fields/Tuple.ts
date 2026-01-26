import { XVTuple, XVType } from "xanv"

class XqlTuple<T extends XVType<any>[] = any> extends XVTuple<T> {
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

   unique() {
      return this.set("unique", () => { }, true)
   }
}

export default XqlTuple