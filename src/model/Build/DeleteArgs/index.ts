import Model from "../..";
import { chunkArray } from "../../../utils/chunker";
import { DeleteArgs, SchemaShape } from "../../types-new";
import BuildFindArgs from "../FindArgs";
import BuildSelectArgs from "../SelectArgs";
import BuildUpdateArgs from "../UpdateArgs";
import BuildWhereArgs from "../WhereArgs";

class BuildDeleteArgs {
   constructor(private args: DeleteArgs<SchemaShape>, private model: Model<SchemaShape>, private isSubquery = false) {

   }

   async results() {
      const model = this.model
      const args = this.args
      const isSubquery = this.isSubquery
      const schema = model.schema()
      const xansql = model.xansql
      const models = xansql.models

      const sargs = new BuildSelectArgs(args.select || {}, model)
      const wargs = new BuildWhereArgs(args.where, model)


      models.forEach(async (m) => {
         const mschema = m.schema()
         for (let col in mschema) {
            const field = mschema[col] as any

            if (field.type === "relation-one" && field.model == model.constructor) {
               const isNullable = field.meta.nullable
               const isSameModel = m.table === model.table
               if (isNullable) {
                  if (isSameModel) {
                     const fargs = new BuildFindArgs({
                        select: {
                           [model.IDColumn]: true
                        },
                        where: args.where
                     }, model)
                     const res = await fargs.results()

                     let ids: number[] = []
                     if (res?.length) {
                        for (let r of res) {
                           ids.push(r[m.IDColumn])
                        }
                     }
                     if (ids.length) {
                        for (let { chunk } of chunkArray(ids)) {
                           const build = new BuildUpdateArgs({
                              data: {
                                 [col]: null
                              },
                              where: {
                                 [col]: {
                                    in: chunk
                                 }
                              }
                           }, model)
                           await build.results()
                        }
                     }
                  } else {
                     const build = new BuildUpdateArgs({
                        data: {
                           [col]: null
                        },
                        where: {
                           [col]: args.where
                        }
                     }, m)
                     await build.results()
                  }

               } else {
                  // delete
                  const build = new BuildDeleteArgs({
                     where: {
                        [col]: args.where
                     }
                  }, m)
                  await build.results()
               }
            }
         }
      })

      // let results = await fargs.results()
      // return results


      // for (let col in schema) {
      //    const field = schema[col] as any
      //    if (field.type === 'relation-many') {
      //       const RModel = xansql.model(field.model)
      //       const _args = sargs.relations[col]
      //       const dargs = new BuildDeleteArgs({}, RModel)
      //    } else if (iof(field, XqlFile)) {

      //    }
      // }

      const sql = `DELETE FROM ${model.table} as ${model.alias} ${wargs.sql}`.trim()
      // console.log(sql);

      // await model.execute(sql)
      // return results

   }
}

export default BuildDeleteArgs