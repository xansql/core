import { xv } from "xanv";
import Model from "../model";
import xt from "../xt";
import Xansql from "./Xansql";
import { XqlFieldInfoSchema } from "../xt/XqlFieldInfo";

class MigrationModel extends Model {
   get table() {
      return "_xansql_migration"
   }
   schema() {
      return {
         id: xt.id(),
         model: xt.string(),
         schema: xt.record(xt.string(), xt.object({
            type: xt.string(),
            length: xt.number().nullable(),
            default: xv.any(),
            unique: xt.boolean(),
            nullable: xt.boolean(),
            index: xt.string()
         })),
         created_at: xt.date().createdAt(),
         updated_at: xt.date().updatedAt(),
      }
   }
}


class Migration {
   model
   constructor(private xansql: Xansql) {
      this.model = xansql.model(MigrationModel)
   }

   async migrate(model: Model) {
      const schema = model.schema()
      let info: { [column: string]: XqlFieldInfoSchema } = {}
      for (let col in schema) {
         const field = schema[col]
         info[col] = field.info.schema
      }

      const has = await this.has(model)
      if (has) {

      }

      return await this.model.create({
         data: {
            model: model.table,
            schema: info
         }
      })
   }

   async get(model: Model) {
      return await this.model.findOne({
         where: {
            model: model.table
         }
      })
   }

   async has(model: Model) {
      return await this.model.count({
         model: model.table
      })
   }
}

export default Migration