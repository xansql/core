import Model from "../.."
import { GropuByArgs } from "../../types-new"

class BuildGroupByArgs {
   readonly sql: string = ''
   constructor(args: GropuByArgs<any>, model: Model<any>) {
      this.sql = `GROUP BY ${args.join(", ")}`
   }
}
export default BuildGroupByArgs;
