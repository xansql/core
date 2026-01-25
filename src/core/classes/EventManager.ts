import Model from "../../model";
import { CreateArgsType, DeleteArgsType, FindArgsType, UpdateArgsType } from "../../model/types";
import { ModelType } from "../types";

type Result = { [key: string]: any };

export type EventPayloads = {
   BEFORE_CREATE: { model: ModelType; args: CreateArgsType };
   BEFORE_UPDATE: { model: ModelType; args: UpdateArgsType };
   BEFORE_DELETE: { model: ModelType; args: DeleteArgsType };
   BEFORE_FIND: { model: ModelType; args: FindArgsType };
   BEFORE_AGGREGATE: { model: ModelType; args: any };

   CREATE: { model: ModelType; results: Result[]; args: CreateArgsType };
   UPDATE: { model: ModelType; results: Result[], args: UpdateArgsType };
   DELETE: { model: ModelType; results: Result[], args: DeleteArgsType };
   FIND: { model: ModelType; results: Result[], args: FindArgsType };
   AGGREGATE: { model: ModelType; results: any; args: any };

};

// correct type: handler only gets its OWN event payload
export type EventHandler<K extends keyof EventPayloads> = (payload: EventPayloads[K]) => void | Promise<void>;

class EventManager {
   private events: {
      [K in keyof EventPayloads]?: EventHandler<K>[];
   } = {};

   on<K extends keyof EventPayloads>(event: K, handler: EventHandler<K>) {
      if (!this.events[event]) {
         this.events[event] = [];
      }
      this.events[event]!.push(handler);
      return this;
   }

   async emit<K extends keyof EventPayloads>(event: K, payload: EventPayloads[K]) {
      const handlers = this.events[event];
      if (!handlers) return this;
      for (const handler of handlers) {
         await handler(payload);
      }
      return this;
   }
}

export default EventManager;
