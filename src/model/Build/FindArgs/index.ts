import Model from "../..";
import { chunkArray } from "../../../utils/chunker";
import XqlRelationMany from "../../../xt/fields/RelationMany";
import XqlRelationOne from "../../../xt/fields/RelationOne";
import { FindArgs } from "../../types-new";
import BuildAggregateArgs from "../AggregateArgs";
import BuildLimitArgs from "../LimitArgs";
import BuildOrderByArgs from "../OrderByArgs";
import BuildSelectArgs from "../SelectArgs";
import BuildWhereArgs from "../WhereArgs";

type SubQueryInfo = {
   column: string,
   ins: number[]
}

class BuildFindArgs<A extends FindArgs<any> = any> {
   constructor(private args: A, private model: Model<any>, private subQueryInfo?: SubQueryInfo) {
   }

   async results() {
      const args = this.args
      const subQueryInfo = this.subQueryInfo
      const model = this.model
      const xansql = model.xansql
      const schema = model.schema()
      const wargs = new BuildWhereArgs(args.where || {}, model)
      const sargs = new BuildSelectArgs((args as any)?.select! || {}, model)
      const largs = new BuildLimitArgs(args.limit || {} as any, model)
      const oargs = new BuildOrderByArgs(args.orderBy || {}, model)

      if (subQueryInfo) {
         if (!sargs.columns.includes(subQueryInfo.column)) {
            sargs.columns.push(subQueryInfo.column)
         }
         wargs.parts.push(`${model.alias}.${subQueryInfo.column} IN (${subQueryInfo.ins.join(",")})`)
      }
      let sql = `SELECT  ${args.distinct ? "DISTINCT" : ""} ${sargs.sql} FROM ${model.table} as ${model.alias} ${wargs.sql} ${largs.sql} ${oargs.sql}`

      if (subQueryInfo && largs.sql) {
         const orderBySql = oargs.sql ? oargs.sql : `ORDER BY ${model.alias}.${model.IDColumn}`
         sql = `
            SELECT ${sargs.columns.join(", ")}
            FROM (
                SELECT
                   ${sargs.sql},
                    ROW_NUMBER() OVER (
                        PARTITION BY ${model.alias}.${subQueryInfo.column}
                        ${orderBySql}
                    ) AS rn
                FROM ${model.table} ${model.alias}
                ${wargs.sql}
            ) AS ${model.alias}
            WHERE rn > ${largs.skip} AND rn <= ${largs.take + largs.skip}
         `
      }

      sql = sql.replace(/\s+/gi, " ")

      // execute model
      const execute = await model.execute(sql)
      const results = execute.results


      if (results.length && Object.keys(sargs.relations).length) {

         // aggregate
         if (args.aggregate) {
            for (let col in args.aggregate) {
               const field = schema[col] as any
               const rinfo = field.relationInfo
               const RModel = xansql.model(field.model)
               const agselect = args.aggregate[col]
               if (!agselect || !Object.keys(agselect).length) continue
               const in_ids: number[] = []
               const indexes: { [id: number]: number } = {}

               for (let i = 0; i < results.length; i++) {
                  const row = results[i]
                  const id = row[rinfo.self.relation]
                  if (id) {
                     indexes[id] = i
                     in_ids.push(id)
                  }
               }

               // make alias
               // for (let agcol in agselect) {
               //    const funcs = agselect[agcol]
               //    for (let func in funcs) {
               //       const v = (funcs as any)[func]
               //       if (isObject(v)) {
               //          (agselect as any)[agcol][func] = {
               //             ...v,
               //             alias: v.alias || `${func}_${rinfo.target.column}_${col}_${agcol}`
               //          }
               //       } else {
               //          (agselect as any)[agcol][func] = {
               //             alias: v.alias || `${func}_${rinfo.target.column}_${col}_${agcol}`
               //          }
               //       }
               //    }
               // }


               const agargs = new BuildAggregateArgs({
                  select: agselect,
                  groupBy: [rinfo.target.column],
                  where: {
                     [rinfo.target.column]: {
                        [rinfo.self.relation]: {
                           in: in_ids
                        }
                     }
                  }
               }, RModel)

               const agresults = await agargs.results()
               if (agresults.length) {
                  for (let { chunk } of chunkArray(agresults)) {
                     for (let ares of chunk) {
                        const id = ares[rinfo.target.relation]
                        const index = indexes[id]
                        delete ares[rinfo.target.column]
                        if (!(results as any)[index]["aggregate"]) {
                           (results as any)[index]["aggregate"] = {}
                        }
                        (results as any)[index]["aggregate"][col] = ares
                     }
                  }
               }
            }
         }

         for (let col in sargs.relations) {

            const field = schema[col] as XqlRelationMany<any> | XqlRelationOne<any>
            const isMany = field.type === 'relation-many'
            const rinfo = field.relationInfo
            const rel_column = rinfo.target.relation
            const in_ids: number[] = []
            const indexes: { [id: number]: number } = {}

            for (let i = 0; i < results.length; i++) {
               const row = results[i]
               const id = row[rinfo.self.relation]
               if (id) {
                  indexes[id] = i
                  in_ids.push(id)
               }

               // row parsing
               for (let rcol in row) {
                  const field: any = schema[rcol]
                  if (!field || field.isRelation) continue
                  row[rcol] = (field as any).value.fromSql(row[rcol])
               }
            }

            if (!in_ids.length) continue

            const RModel = xansql.model(field.model)
            const rargs = sargs.relations[col]

            const f = new BuildFindArgs(rargs as any, RModel, {
               column: rel_column,
               ins: in_ids
            })
            const rel_results = await f.results()

            if (rel_results.length) {
               for (let { chunk } of chunkArray(rel_results)) {
                  for (let rres of chunk) {
                     const id = rres[rinfo.target.relation]
                     const index = indexes[id]

                     if (isMany) {
                        if (!results[index][rinfo.self.column]) {
                           results[index][rinfo.self.column] = []
                        }
                        results[index][rinfo.self.column].push(rres)
                        delete rres[rinfo.target.column]
                     } else {
                        results[index][rinfo.self.column] = rres
                     }
                  }
               }
            }
         }
      }

      return results
   }
}

export default BuildFindArgs