import Model from "../model";
import { ExecuterResult, ModelType, XansqlConfigType, XansqlConfigTypeRequired } from "./types";
import XansqlTransaction from "./classes/XansqlTransaction";
import XansqlConfig from "./classes/XansqlConfig";
import ModelFactory from "./classes/ModelFactory";
import XansqlMigration from "./classes/XansqlMigrartion";
import EventManager, { EventHandler, EventPayloads } from "./classes/EventManager";
import XansqlError from "./XansqlError";
import { XqlSchemaShape } from "../xt/types";

class Xansql {
   private ModelFactory: ModelFactory;
   private XansqlConfig: XansqlConfig;
   readonly config: XansqlConfigTypeRequired;
   readonly XansqlTransaction: XansqlTransaction;
   readonly EventManager: EventManager
   readonly XansqlMigration: XansqlMigration

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

   get models() {
      return this.ModelFactory.models
   }
   get aliases() {
      return this.ModelFactory.aliases
   }

   clone(config?: Partial<XansqlConfigType>) {
      const self = new XansqlClone({ ...this.config, ...(config || {}) });
      for (let [table, model] of this.models) {
         self.model(table, model.schema);
      }
      return self;
   }

   model<T extends string, S extends XqlSchemaShape>(table: T, schema: S): Model<this, T, S> {
      const model = new Model(this, table, schema);
      if (this.ModelFactory.models.has(table)) {
         throw new XansqlError({
            message: `Model for table ${table} already exists.`,
            model: table,
         });
      }
      this.ModelFactory.set(model);
      return model
   }

   getModel<T extends string>(table: T) {
      if (!this.models.has(table)) {
         throw new XansqlError({
            message: `Model for table ${table} does not exist.`,
            model: table,
         });
      }
      return this.models.get(table) as Model<this, T, XqlSchemaShape>
   }

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