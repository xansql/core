import { XVEnum } from "xanv"
import { XansqlDialectEngine } from "../../core/types"
import XqlFieldInfo from "../XqlFieldInfo"
import { escapeSqlValue } from "../../utils"

class XqlEnum<const T extends string | number> extends XVEnum<T> {
   table!: string
   column_name!: string
   engine!: XansqlDialectEngine

   get info(): XqlFieldInfo {
      return new XqlFieldInfo(this)
   }

   toSql(value: unknown): string | "NULL" {
      const _value = super.parse(value) as string
      if (_value === undefined || _value === null) return 'NULL';
      return `'${escapeSqlValue(_value)}'`
   }

   fromSql(value: string): ReturnType<typeof this.parse> {
      if (value === null || value === undefined) return null
      return JSON.parse(value);
   }

   optional(): any {
      throw new Error("optional not supported");
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