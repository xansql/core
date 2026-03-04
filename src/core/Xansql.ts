import Model from "../model";
import { ExecuterResult, XansqlConfigType, XansqlConfigTypeRequired, XansqlFileMeta, XansqlFilUploadArgs } from "./types";
import XansqlTransaction from "./classes/XansqlTransaction";
import XansqlConfig from "./classes/XansqlConfig";
import ModelFactory from "./classes/ModelFactory";
import XansqlMigration from "./classes/XansqlMigrartion";
import EventManager, { EventHandler, EventPayloads } from "./classes/EventManager";
import XansqlError from "./XansqlError";
import { ModelClass, SchemaShape } from "../model/types-new";
import { chunkFile, getFileId, totalChunks } from "../utils/file";


class Xansql {
   private ModelFactory: ModelFactory;
   private XansqlConfig: XansqlConfig;
   readonly config: XansqlConfigTypeRequired;
   readonly XansqlTransaction: XansqlTransaction;
   // readonly EventManager: EventManager
   // readonly XansqlMigration: XansqlMigration
   readonly models = new Map<ModelClass<any>, Model>()

   constructor(config: XansqlConfigType) {
      this.XansqlConfig = new XansqlConfig(this, config);
      this.config = this.XansqlConfig.parse()
      this.XansqlTransaction = new XansqlTransaction(this);
      this.ModelFactory = new ModelFactory();

      // this.XansqlMigration = new XansqlMigration(this);
      // this.EventManager = new EventManager();
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

   async uploadFile(file: XansqlFilUploadArgs) {
      const fileConfig = this.config.file
      if (!fileConfig?.upload) {
         throw new XansqlError({
            code: "INTERNAL_ERROR",
            message: `File upload is not supported by the current dialect.`
         });
      }
      if (file instanceof File) {
         // make chunk
         const fileId = await getFileId(file);

         const maxFileSize = fileConfig?.maxFilesize
         if (maxFileSize && file.size > maxFileSize * 1024) {
            throw new Error(`File size exceeds the limit of ${maxFileSize / 1024} MB`)
         }

         const chunkSize = fileConfig?.chunkSize

         // send metadata
         const filemeta: XansqlFileMeta = {
            fileId: fileId,
            name: file.name,
            size: file.size,
            type: file.type,
            totalChunks: totalChunks(file, chunkSize),
            chunkIndex: 0,
            isFinish: false
         }
         for await (let { chunk, chunkIndex } of chunkFile(file, chunkSize)) {
            filemeta.chunkIndex = chunkIndex;
            filemeta.isFinish = chunkIndex + 1 === filemeta.totalChunks;
            filemeta.chunkIndex = chunkIndex
            await this.uploadFile({
               chunk,
               meta: filemeta
            })
         }
         return
      }

      return await this.config.file.upload(file.chunk, file.meta);
   }

   async deleteFile(fileId: string) {
      if (!this.config.file?.delete) {
         throw new XansqlError({
            code: "INTERNAL_ERROR",
            message: `File delete is not supported by the current dialect.`
         });
      }
      return await this.config.file.delete(fileId);
   }

   async transaction(callback: () => Promise<any>) {
      return await this.XansqlTransaction.transaction(callback);
   }

   async migrate(force?: boolean) {
      // await this.XansqlMigration.migrate(force);
   }
}

class XansqlClone extends Xansql { }


export default Xansql