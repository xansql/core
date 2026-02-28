import Model from "../..";
import XqlRelationMany from "../../../xt/fields/RelationMany";
import XqlRelationOne from "../../../xt/fields/RelationOne";
import { FindArgs } from "../../types-new";
import BuildSelectArgs from "../SelectArgs";
import BuildWhereArgs from "../WhereArgs";

class BuildFindArgs {
   constructor(private args: FindArgs<any>, private model: Model, private relColumn: string | null = null) {

   }

   async results() {
      const args = this.args
      const relColumn = this.relColumn
      const model = this.model
      const xansql = model.xansql
      const schema = model.schema()
      const wargs = new BuildWhereArgs(args.where || {}, model)
      const sargs = new BuildSelectArgs((args as any)?.select! || {}, model, args.distinct)

      if (relColumn && !sargs.columns.includes(relColumn)) {
         sargs.columns.push(relColumn)
      }

      let sql = ''

      if (relColumn) {
         sql = `${sargs.sql} ${wargs.sql}`
      } else {
         sql = `${sargs.sql} ${wargs.sql}`
         console.log(sql);

      }

      // execute model
      const execute = await model.execute(sql)
      const results = execute.results

      // for (let col in sargs.relations) {
      //    const field = schema[col] as XqlRelationMany<any> | XqlRelationOne<any>
      //    const RModel = xansql.model(field.model)
      //    const rinfo = field.relationInfo
      //    const rargs = sargs.relations[col]
      //    const rel_column = rinfo.target.relation
      //    const f = new BuildFindArgs(rargs as any, RModel, rel_column)
      //    const rel_results = await f.results()

      //    for (let result of results) {
      //       for (let rel_result of rel_results) {
      //          result[rinfo.target.column] = rel_result
      //       }
      //    }
      // }

      return results
   }
}

export default BuildFindArgs