import { XVDate, XVOptional } from "xanv"

class XqlDate extends XVDate {
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

   update(): XVOptional<this> & { meta: { update: true } } {
      return this.set("update", () => { }, true).default(() => new Date()) as any
   }

   create(): XVOptional<this> & { meta: { create: true } } {
      return this.index().default(() => new Date()).set("create", () => { }, true) as any
   }
}

export default XqlDate