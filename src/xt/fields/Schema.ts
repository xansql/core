import { XVType } from "xanv";
import { isObject } from "../../utils";

class XqlSchema<T extends string, C extends string> extends XVType<T> {
   type = "schema";
   readonly table: T;
   readonly column: C;
   dynamic = false;

   relation = {
      main: "",
      target: ""
   }

   constructor(table: T, column: C) {
      super();
      this.table = table;
      this.column = column;
      this.index();
   }

   protected check(value: any) {

      let msg = `Value must be a positive integer or an ${this.table} object`;
      if (Number.isInteger(value)) {
         if (value <= 0) {
            throw new Error(msg);
         }
      } else if (isObject(value)) {
         if (!(this.relation.main in value)) {
            throw new Error(msg);
         }
         const id = value[this.relation.main];
         if (!Number.isInteger(id) || id <= 0) {
            throw new Error("ID must be a positive integer");
         }
      } else {
         throw new Error(msg);
      }
      return value
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

export default XqlSchema