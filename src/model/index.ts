import Schema from "../core/Schema";
import { ModelCallback } from "../core/types";
import Xansql from "../core/Xansql";
import XansqlError from "../core/XansqlError";
import { iof } from "../utils";
import xt from "../xt";
import XqlIDField from "../xt/fields/IDField";
import { XqlSchemaShape } from "../xt/types";
import RelationExecuteArgs from "./Args/RelationExcuteArgs";
import ModelBase from "./Base";
import AggregateExecuter from "./Executer/Aggregate";
import CreateExecuter from "./Executer/Create";
import DeleteExecuter from "./Executer/Delete";
import FindExecuter from "./Executer/Find";
import UpdateExecuter from "./Executer/Update";
import Migrations from "./Migrations";
import { AggregateArgs, AggregateResult, CreateArgs, DeleteArgs, FindArgs, ResultArgs, UpdateArgs, WhereArgs } from "./types";
import { SchemaColumnList, SchemaRelationColumnList } from "./types-new";

class Model<Xql extends Xansql, S extends Schema> {
   readonly xansql: Xql
   readonly schema: S
   readonly columns: string[] = []
   readonly relation_columns: string[] = []

   constructor(xansql: Xql, schema: S) {
      this.xansql = xansql
      this.schema = schema
      const shape = schema.schema()

      for (let column in shape) {
         const field = shape[column]
         if (field.isRelation) {
            this.relation_columns.push(column)

            // if (field.type == 'relation-one') {
            //    field.info = {
            //       self: {
            //          table: schema.table,
            //          relation: column,
            //          column: column,
            //       },
            //       target: {
            //          table: field.schema.table,
            //          relation: field.schema.IDColumn,
            //          column: field.column,
            //       },
            //       sql: `${schema.table}.${column} = ${field.schema.table}.${field.schema.IDColumn}`
            //    }
            // } else if (field.type == 'relation-many') {
            //    field.info = {
            //       self: {
            //          table: schema.table,
            //          relation: schema.IDColumn,
            //          column: column,
            //       },
            //       target: {
            //          table: field.schema.table,
            //          relation: field.column,
            //          column: field.column,
            //       },
            //       sql: `${schema.table}.${schema.IDColumn} = ${field.schema.table}.${field.column}`
            //    }
            // }
         } else {
            this.columns.push(column)
         }
      }
   }

   find(where: Partial<typeof this.schema.schema>) {

   }
}

export default Model;
