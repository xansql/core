import { XVNumber } from "xanv"

class XqlIDField extends XVNumber {
   readonly type = "id"
   optional() {
      throw new Error("Optional not allowed")
      return super.optional()
   }
   nullable() {
      throw new Error("nullable not allowed")
      return super.nullable();
   }
}

export default XqlIDField