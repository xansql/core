import Model from "../model";
import { ExecuterResult, ModelCallback, ModelType, XansqlConfigType, XansqlConfigTypeRequired } from "./types";
import XansqlTransaction from "./classes/XansqlTransaction";
import XansqlConfig from "./classes/XansqlConfig";
import ModelFactory from "./classes/ModelFactory";
import XansqlMigration from "./classes/XansqlMigrartion";
import EventManager, { EventHandler, EventPayloads } from "./classes/EventManager";
import XansqlError from "./XansqlError";
import Schema, { SchemaClass } from "./Schema";


class Xansql {
   private ModelFactory: ModelFactory;
   private XansqlConfig: XansqlConfig;
   readonly config: XansqlConfigTypeRequired;
   readonly XansqlTransaction: XansqlTransaction;
   readonly EventManager: EventManager
   readonly XansqlMigration: XansqlMigration
   readonly models = new Map<new () => Schema, Schema>()

   constructor(config: XansqlConfigType) {
      this.XansqlConfig = new XansqlConfig(this, config);
      this.config = this.XansqlConfig.parse()
      this.XansqlTransaction = new XansqlTransaction(this);
      this.ModelFactory = new ModelFactory();

      this.XansqlMigration = new XansqlMigration(this);
      this.EventManager = new EventManager();
   }

   get dialect() {
      return this.config.dialect;
   }

   get aliases() {
      return this.ModelFactory.aliases
   }

   model<S extends Schema>(schema: SchemaClass<S>, hooks?: any) {
      if (this.models.has(schema)) {
         return this.models.get(schema) as Schema<S>
      }
      const _schema = new schema(this)
      this.models.set(schema, _schema)
      return _schema as Schema<S>
   }
   _model<S extends Schema>(schema: SchemaClass<S>, hooks?: any) {
      // if (this.models.has(schema)) {
      //    return this.models.get(schema) as Model<this, S> & Omit<InstanceType<typeof schema>, "schema" | "table" | "IDColumn" | "model">
      // }

      const _schema = new schema(this) as Schema<S>
      const model = new Model(this, _schema)

      // get all props and methods from schema and assign to model
      for (let key of Object.getOwnPropertyNames(Object.getPrototypeOf(_schema))) {
         if (key !== "constructor" && key !== "schema" && key !== "table" && key !== "IDColumn") {
            if (key in model) {
               throw new Error(`Property ${key} already exists in model ${_schema.table}. Please rename the method or property in the schema.`)
            }
            const descriptor = Object.getOwnPropertyDescriptor(Object.getPrototypeOf(_schema), key)
            if (descriptor) {
               Object.defineProperty(model, key, descriptor)
            }
         }
      }

      // assign props from schema to model
      for (let key of Object.keys(_schema)) {
         if (key in model) {
            throw new Error(`Property ${key} already exists in model ${_schema.table}. Please rename the method or property in the schema.`)
         }
         if (["_talbe", "_IDColumn", "model"].includes(key)) continue;
         const descriptor = Object.getOwnPropertyDescriptor(_schema, key)
         if (descriptor) {
            Object.defineProperty(model, key, descriptor)
         }
      }

      _schema.model = model
      this.models.set(schema, model)

      const shape = _schema.schema()
      for (let column in shape) {
         const field = shape[column]
         if (field.isRelation && !this.models.has(field.schema)) {
            this.model(field.schema)
         }

         // check if relation target exists         
         if (field.isRelation && field.type === "relation-many") {
            const targetColumn = field.column
            const targetSchema = field.schema
            const targetModel = this.models.get(targetSchema)

            if (!targetModel) {
               throw new Error(`Target model for relation ${column} in schema ${_schema.table} not found. Please define the target schema before defining the relation.`)
            }

            const targetShape = targetModel.schema.schema()
            if (!targetShape[targetColumn] || targetShape[targetColumn].type !== "relation-one") {
               throw new Error(`Target column ${targetColumn} for relation ${column} in schema ${_schema.table} not found in target schema ${targetSchema.table}. Please define the target column in the target schema.`)
            }
         }

         // update relation info
         if (field.isRelation) {

            if (field.type == 'relation-one') {
               console.log(field);

               field.info = {
                  self: {
                     table: _schema.table,
                     relation: column,
                     column: column,
                  },
                  target: {
                     table: field.schema.table,
                     relation: field.schema.IDColumn,
                     column: field.column,
                  },
                  sql: `${_schema.table}.${column} = ${field.schema.table}.${field.schema.IDColumn}`
               }
            } else if (field.type == 'relation-many') {
               field.info = {
                  self: {
                     table: _schema.table,
                     relation: _schema.IDColumn,
                     column: column,
                  },
                  target: {
                     table: field.schema.table,
                     relation: field.column,
                     column: field.column,
                  },
                  sql: `${_schema.table}.${_schema.IDColumn} = ${field.schema.table}.${field.column}`
               }
            }
         }
      }


      // create table if not exists

      return model as unknown as Model<this, S> & Omit<typeof _schema, "schema" | "table" | "IDColumn" | "model">
   }

   // getModel<S extends Schema>(table: string) {
   //    if (!this.models.has(table)) {
   //       throw new XansqlError({
   //          message: `Model for table ${table} does not exist.`,
   //          model: table,
   //       });
   //    }
   //    return this.models.get(table) as Model<this, S>
   // }

   async execute(sql: string): Promise<ExecuterResult> {
      const query = sql.trim().replace(/\s+/g, ' ');

      if (this.config.debug) {
         console.log(`[DB] Executing → ${query}`);
      }

      try {
         const result = await this.dialect.execute(query, this) as ExecuterResult;

         if (this.config.debug) {
            console.log(`[DB] Executed ✓`);
            console.dir(result, { depth: null });
         }

         return result;
      } catch (error) {
         if (this.config.debug) {
            console.error(`[DB] Execution failed ✗`);
            console.error(query);
         }

         throw error; // never swallow DB errors
      }
   }


   async getRawSchema() {
      return await this.dialect.getSchema(this);
   }

   async uploadFile(file: File) {
      if (!this.dialect.file?.upload) {
         throw new XansqlError(`File upload is not supported by the current dialect.`);
      }
      return await this.dialect.file.upload(file, this);
   }

   async deleteFile(fileId: string) {
      if (!this.dialect.file?.delete) {
         throw new XansqlError(`File delete is not supported by the current dialect.`);
      }
      return await this.dialect.file.delete(fileId, this);
   }

   async transaction(callback: () => Promise<any>) {
      return await this.XansqlTransaction.transaction(callback);
   }

   async migrate(force?: boolean) {
      await this.XansqlMigration.migrate(force);
   }

   on<K extends keyof EventPayloads>(event: K, handler: EventHandler<K>) {
      this.EventManager.on(event, handler);
   }

}

class XansqlClone extends Xansql { }


export default Xansql