import Model from "../..";
import XansqlError from "../../../core/XansqlError";
import { isObject } from "../../../utils";
import { RelationManyInfo } from "../../../xt/fields/RelationMany";
import { SchemaShape, WhereArgs, WhereSubConditionArgs } from "../../types-new";


type Aliases = {
   [table: string]: number
}

class BuildWhereArgs<S extends SchemaShape, M extends Model<any>> {
   readonly parts: string[];
   private model: M

   get sql() {
      if (!this.parts.length) return "";
      return `WHERE ${this.parts.join(" AND ")}`;
   }

   constructor(args: WhereArgs<S>, model: M, aliases: Aliases = {}) {
      this.model = model
      const xansql = model.xansql
      const schema = model.schema();
      const parts: string[] = [];
      const aliasDept = aliases[model.table] || 0
      const alias = `${model.alias}${aliasDept || ""}`
      aliases[model.table] = aliasDept + 1

      if (Array.isArray(args)) {
         const _parts = []
         for (const arg of args) {
            const w_parts = new BuildWhereArgs(arg, model).parts
            if (w_parts.length) {
               if (w_parts.length > 1) {
                  _parts.push(`(${w_parts.join(" AND ")})`)
               } else {
                  _parts.push(w_parts.join(" AND "))
               }
            }
         }
         if (_parts.length) {
            parts.push(_parts.join(" OR "))
         }
      } else {
         for (const col in args) {
            const val = args[col];
            if (!(col in schema)) {
               throw new XansqlError({
                  code: "NOT_FOUND",
                  model: model.table,
                  field: col,
                  message: `Unknown column ${col} in ${model.table}`,
               });
            }

            const field = schema[col];
            if (field.isRelation) {
               const relArgs = val as WhereArgs<any>;
               const RModel = xansql.model(field.model);
               const ralias = `${RModel.alias}${aliasDept || ""}`
               const rinfo = field.relationInfo as RelationManyInfo
               const relationSql = `${alias}.${rinfo.self.relation}=${ralias}.${rinfo.target.relation}`
               const relParts: string[] = [];

               if (Array.isArray(relArgs)) {
                  const parts = []
                  for (const rargs of relArgs) {
                     if (!isObject(rargs)) continue;
                     const relWhere = new BuildWhereArgs(rargs, RModel, aliases);
                     const relSql = relWhere.parts.join(" AND ");
                     if (relSql) {
                        const keys = Object.keys(rargs);
                        if (keys.length > 1) {
                           parts.push(`(${relSql})`)
                        } else {
                           parts.push(relSql)
                        }
                     }
                  }
                  if (parts.length) {
                     const sql = `(${parts.join(" OR ")})`
                     relParts.push(
                        `EXISTS (SELECT 1 FROM ${RModel.table} as ${ralias} WHERE ${relationSql}${sql ? ` AND ${sql}` : ""})`
                     );
                  }
               } else {
                  const relWhere = new BuildWhereArgs(relArgs, RModel, aliases);
                  const relSql = relWhere.parts.join(" AND ");
                  relParts.push(
                     `EXISTS (SELECT 1 FROM ${RModel.table} as ${ralias} WHERE ${relationSql}${relSql ? ` AND ${relSql}` : ""})`
                  );
               }
               if (relParts.length === 1) parts.push(relParts[0]);
               else if (relParts.length > 1) parts.push(`(${relParts.join(" OR ")})`);
               continue;
            }


            // Array of subconditions → OR
            if (Array.isArray(val)) {
               const subParts: string[] = [];
               for (const subargs of val as any) {
                  if (!isObject(subargs)) {
                     throw new XansqlError({
                        message: "Invalid argument",
                        code: "VALIDATION_ERROR",
                        model: model.table,
                        field: col,
                        params: subargs
                     })
                  }
                  const cond = this.condition(col, subargs);
                  if (cond) {
                     const keys = Object.keys(subargs);
                     if (keys.length > 1) {
                        subParts.push(`(${cond})`);
                     } else {
                        subParts.push(cond);
                     }
                  }
               }

               if (subParts.length) {
                  const keys = Object.keys(val);
                  if (keys.length > 1) {
                     parts.push(`(${subParts.join(" OR ")})`);
                  } else {
                     parts.push(`${subParts.join(" OR ")}`);
                  }
               }

               continue;
            }

            // Subcondition object
            if (isObject(val)) {
               const keys = Object.keys(val);
               const cond = this.condition(col, val);
               if (cond) {
                  if (keys.length > 1) {
                     parts.push(`(${cond})`);
                  } else {
                     parts.push(cond);
                  }
               }

               continue;
            }
            // Direct primitive
            parts.push(`${alias}.${col}=${this.format(col, val)}`);

         }
      }
      this.parts = parts;
   }

   condition(column: string, subargs: WhereSubConditionArgs<any>) {
      const parts: string[] = [];
      const col_name = `${this.model.table}.${column}`
      for (const key in subargs) {
         const val = (subargs as any)[key];

         switch (key) {
            case "is":
               if (val === null) {
                  parts.push(`${col_name} IS NULL`);
               } else {
                  parts.push(`${col_name} = ${this.format(column, val)}`);
               }
               break;
            case "not":
               if (Array.isArray(val)) {
                  const notParts: string[] = [];
                  for (const v of val) {
                     if (!isObject(v)) {
                        throw new XansqlError({
                           code: "QUERY_ERROR",
                           message: "Invalid where condition",
                           field: column,
                           model: this.model.table,
                        })
                     }
                     const cond = this.condition(column, v as WhereSubConditionArgs<any>);
                     if (cond) {
                        const keys = Object.keys(v);
                        if (keys.length > 1) {
                           notParts.push(`(${cond})`)
                        } else {
                           notParts.push(cond)
                        }
                     }
                  }
                  if (notParts.length) {
                     parts.push(`NOT (${notParts.join(" OR ")})`);
                  }
               } else if (isObject(val)) {
                  parts.push(`NOT (${this.condition(column, val)})`);
               } else if (val === null) {
                  parts.push(`${col_name} IS NOT NULL`)
               } else {
                  parts.push(`${col_name} != ${this.format(column, val)}`);
               }
               break;

            case "lt":
               parts.push(`${col_name} < ${this.format(column, val)}`);
               break;

            case "lte":
               parts.push(`${col_name} <= ${this.format(column, val)}`);
               break;

            case "gt":
               parts.push(`${col_name} > ${this.format(column, val)}`);
               break;

            case "gte":
               parts.push(`${col_name} >= ${this.format(column, val)}`);
               break;

            case "in":
               if (val?.length) {
                  parts.push(
                     `${col_name} IN (${val.map((v: any) => this.format(column, v)).join(", ")})`
                  );
               }
               break;

            case "notIn":
               if (val?.length) {
                  parts.push(
                     `${col_name} NOT IN (${val.map((v: any) => this.format(column, v)).join(", ")})`
                  );
               }
               break;

            case "between":
               parts.push(
                  `${col_name} BETWEEN ${this.format(column, val[0])} AND ${this.format(column, val[1])}`
               );
               break;

            case "contains":
               parts.push(`${col_name} LIKE ${this.format(column, `%${val}%`, false)}`);
               break;

            case "startsWith":
               parts.push(`${col_name} LIKE ${this.format(column, `${val}%`, false)}`);
               break;

            case "endsWith":
               parts.push(`${col_name} LIKE ${this.format(column, `%${val}`, false)}`);
               break;
         }
      }

      return parts.join(" AND ");
   }

   private format(column: string, value: any, parse = true) {
      const model = this.model;
      const schema = model.schema()
      const field = schema[column];

      if (parse) {
         try {
            value = field.parse(value)
         } catch (error: any) {
            throw new XansqlError({
               code: "VALIDATION_ERROR",
               model: model.table,
               field: column,
               sql: `${column}=${value}`,
               message: error.message
            });
         }
      }

      if (value instanceof Date) {
         return `'${value.toISOString()}'`;
      }

      if (typeof value === "string") {
         return `'${value.replace(/'/g, "''")}'`;
      }

      if (typeof value === "boolean") {
         return value ? "TRUE" : "FALSE";
      }

      if (value === null) {
         return "NULL";
      }

      return value;
   }

}

export default BuildWhereArgs;
