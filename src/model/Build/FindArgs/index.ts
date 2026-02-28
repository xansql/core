import Model from "../..";
import XqlRelationMany from "../../../xt/fields/RelationMany";
import XqlRelationOne from "../../../xt/fields/RelationOne";
import { FindArgs, Normalize } from "../../types-new";
import BuildSelectArgs from "../SelectArgs";
import BuildWhereArgs from "../WhereArgs";

class BuildFindArgs<A extends FindArgs<any> = any> {
   readonly BuildWhere
   readonly BuildSelect
   constructor(private args: A, private model: Model, private relColumn: string | null = null) {
      this.BuildWhere = new BuildWhereArgs(args.where || {}, model)
      this.BuildSelect = new BuildSelectArgs((args as any)?.select! || {}, model, args.distinct)
   }

   async results(): Promise<Normalize<A>> {
      const relColumn = this.relColumn
      const model = this.model
      const xansql = model.xansql
      const schema = model.schema()
      const wargs = this.BuildWhere
      const sargs = this.BuildSelect

      if (relColumn && !sargs.columns.includes(relColumn)) {
         sargs.columns.push(relColumn)
      }

      let sql = ''

      if (relColumn) {
         sql = `${sargs.sql} ${wargs.sql}`
      } else {
         sql = `${sargs.sql} ${wargs.sql}`
      }

      // execute model
      const execute = await model.execute(sql)
      const results = execute.results

      if (results.length && Object.keys(sargs.relations).length) {
         for (let col in sargs.relations) {
            const field = schema[col] as XqlRelationMany<any> | XqlRelationOne<any>
            const RModel = xansql.model(field.model)
            const rinfo = field.relationInfo
            const rargs = sargs.relations[col]
            const rel_column = rinfo.target.relation
            const f = new BuildFindArgs(rargs as any, RModel, rel_column)
            const rel_results = await f.results()
            if (rel_results.length) {
               for (let result of results) {
                  for (let rel_result of rel_results) {
                     result[rinfo.target.column] = rel_result
                  }
               }
            }
         }
      }

      return results as any
   }
}

export default BuildFindArgs