import Model from "../..";
import XansqlError from "../../../core/XansqlError";
import { LimitArgs } from "../../types-new";

class BuildLimitArgs {
   readonly sql

   constructor(args: LimitArgs, model: Model<any>) {
      const xansql = model.xansql
      const maxLimit = xansql.config.maxLimit.find

      if (args === "all") {
         this.sql = ``
      } else {
         let take = args.take ?? maxLimit
         let skip = args.skip ?? 0
         if (take < 0 || !Number.isInteger(take)) {
            throw new XansqlError({
               code: "QUERY_ERROR",
               message: `Invalid take value in limit clause`,
               model: model.table
            })
         }
         if (skip < 0 || !Number.isInteger(skip)) {
            throw new XansqlError({
               code: "QUERY_ERROR",
               message: `Invalid skip value in limit clause`,
               model: model.table
            })
         }

         this.sql = `LIMIT ${take} ${skip ? `OFFSET ${skip} ` : ""}`.trim()
      }
   }

}

export default BuildLimitArgs 