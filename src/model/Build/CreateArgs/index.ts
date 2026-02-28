import Model from "../..";
import XansqlError from "../../../core/XansqlError";
import { iof, isNumber, isObject, quote } from "../../../utils";
import XqlDate from "../../../xt/fields/Date";
import XqlFile from "../../../xt/fields/File";
import { CreateArgs, SchemaShape } from "../../types-new";

class BuildCreateArgs {
   constructor(private args: CreateArgs<SchemaShape>, private model: Model<any>) {
      const data = args.data
      if (Array.isArray(data)) {
         for (let d of data) {
            this.validateData(d)
         }
      } else {
         this.validateData(data)
      }
   }

   async results() {
      const model = this.model
      const xansql = this.model.xansql
      const args = this.args
      const schema = model.schema()
      const data = args.data

      if (Array.isArray(data)) {
         for (let d of data) {
            const build = new BuildCreateArgs({ data: d }, model)
            await build.results()
         }
      } else {
         const values: { [col: string]: any } = {}
         const relations: { [col: string]: CreateArgs<any>['data'] } = {}

         for (let col in data) {
            const value = data[col]
            const field = schema[col]
            if (field.isRelation) {
               if (field.type === "relation-one") {
                  values[quote(xansql.dialect.engine, col)] = value
               } else {
                  relations[col] = value
               }
            } else {
               if (iof(field, XqlFile)) {
                  try {
                     const filemeta = await xansql.uploadFile(value)
                     values[quote(xansql.dialect.engine, col)] = `'${JSON.stringify(filemeta)}'`
                  } catch (error: any) {
                     throw new XansqlError({
                        code: "FILE_ERROR",
                        message: error.message,
                        model: model.table,
                        field: col
                     })
                  }
               } else {
                  try {
                     values[quote(xansql.dialect.engine, col)] = field.value.toSql(value)
                  } catch (error: any) {
                     throw new XansqlError({
                        code: "VALIDATION_ERROR",
                        message: error.message,
                        model: model.table,
                        field: col
                     })
                  }
               }
            }
         }

         // set create and update
         for (let col in schema) {
            const field = schema[col]
            if (iof(field, XqlDate) && (field.meta.createAt || field.meta.updateAt)) {
               const v = field.value.toSql(new Date())
               values[col] = v
            }
         }

         let sql = `INSERT INTO ${model.table} (${Object.keys(values).join(', ')}) VALUES (${Object.values(values).join(", ")})`

         const results = await model.execute(sql)
         const insertId = results?.insertId
         if (insertId && Object.keys(relations).length) {
            for (let col in relations) {
               const rdata = relations[col]
               const field = schema[col]
               const rinfo = field.relationInfo
               const RModel = xansql.model(field.model)
               if (Array.isArray(rdata)) {
                  for (let d of rdata) {
                     d[rinfo.target.relation] = insertId
                  }
               } else {
                  rdata[rinfo.target.relation] = insertId
               }

               const build = new BuildCreateArgs({ data: rdata }, RModel)
               await build.results()
            }
         }

         return results
      }
   }

   private validateData(data: any) {
      const model = this.model
      const schema = model.schema()

      if (!isObject(data)) {
         throw new XansqlError({
            code: "VALIDATION_ERROR",
            message: `data must be an object`,
            model: model.table,
            params: data
         })
      }


      // check if idColumn exists
      if (model.IDColumn in data) {
         throw new XansqlError({
            code: "VALIDATION_ERROR",
            message: `Cannot set value for ${model.table}.${model.IDColumn}.`,
            model: model.table,
            field: model.IDColumn,
         })
      }

      for (let col in data) {
         const value = data[col]
         const field = schema[col]

         if (field.meta.create || field.meta.update) {
            if (col in data) {
               throw new XansqlError({
                  code: "VALIDATION_ERROR",
                  message: `Cannot set value for ${model.table}.${col}. It is automatically managed.`,
                  model: model.table,
                  field: col,
               })
            }
         }

         if (field.type === "relation-one" && !isNumber(value)) {
            throw new XansqlError({
               code: "VALIDATION_ERROR",
               message: `Invalid value for foreign key column ${model.table}.${col}. Expected number, got ${typeof value}`,
               model: model.table,
               field: col,
            })
         }

         if (iof(field, XqlFile) && !iof(value, File)) {
            throw new XansqlError({
               code: "VALIDATION_ERROR",
               message: `Value should be a File receved ${typeof value}`,
               model: model.table,
               field: col
            })
         }
      }
   }
}

export default BuildCreateArgs