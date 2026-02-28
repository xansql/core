import Model from "../model";
import { ExecuterResult, XansqlConfigType, XansqlConfigTypeRequired } from "./types";
import XansqlTransaction from "./classes/XansqlTransaction";
import XansqlConfig from "./classes/XansqlConfig";
import ModelFactory from "./classes/ModelFactory";
import XansqlMigration from "./classes/XansqlMigrartion";
import EventManager, { EventHandler, EventPayloads } from "./classes/EventManager";
import XansqlError from "./XansqlError";
import { ModelClass, SchemaShape } from "../model/types-new";


class Xansql {
   private ModelFactory: ModelFactory;
   private XansqlConfig: XansqlConfig;
   readonly config: XansqlConfigTypeRequired;
   readonly XansqlTransaction: XansqlTransaction;
   readonly EventManager: EventManager
   readonly XansqlMigration: XansqlMigration
   readonly models = new Map<ModelClass<any>, Model>()

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

   model<M extends Model<any>>(model: ModelClass<M>, hooks?: any) {
      if (this.models.has(model)) {
         return this.models.get(model) as Model<ReturnType<M['schema']>>
      }

      const _model = new model(this)
      this.models.set(model, _model)
      return _model as Model<ReturnType<M['schema']>>
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
         throw new XansqlError({
            code: "INTERNAL_ERROR",
            message: `File upload is not supported by the current dialect.`
         });
      }
      return await this.dialect.file.upload(file, this);
   }

   async deleteFile(fileId: string) {
      if (!this.dialect.file?.delete) {
         throw new XansqlError({
            code: "INTERNAL_ERROR",
            message: `File delete is not supported by the current dialect.`
         });
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