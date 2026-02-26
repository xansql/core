import Model from "../..";
import XansqlError from "../../../core/XansqlError";
import { isObject } from "../../../utils";
import { SchemaShape, WhereArgs, WhereSubConditionArgs } from "../../types-new";

class BuildWhereArgs<S extends SchemaShape, M extends Model<any>> {
   readonly parts: string[];
   private model: M

   get sql() {
      if (!this.parts.length) return "";
      return `WHERE ${this.parts.join(" AND ")}`;
   }

   constructor(args: WhereArgs<S>, model: M) {
      this.model = model
      const xansql = model.xansql
      const schema = model.schema();
      const parts: string[] = [];

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
            const relArgs = val as WhereArgs<any> | WhereArgs<any>[];
            const RModel = xansql.model(field.model);
            const relationSql = (field as any).relationInfo.sql;
            const relParts: string[] = [];

            if (Array.isArray(relArgs)) {
               const parts = []
               for (const rargs of relArgs) {
                  if (!isObject(rargs)) continue;
                  const relWhere = new BuildWhereArgs(rargs, RModel);
                  const relSql = relWhere.parts.join(" AND ");
                  parts.push(`(${relSql})`)

               }
               if (parts.length) {
                  const sql = `(${parts.join(" OR ")})`
                  relParts.push(
                     `EXISTS (SELECT 1 FROM ${RModel.table} WHERE ${relationSql}${sql ? ` AND ${sql}` : ""})`
                  );
               }
            } else {
               const relWhere = new BuildWhereArgs(relArgs, RModel);
               const relSql = relWhere.parts.join(" AND ");
               relParts.push(
                  `EXISTS (SELECT 1 FROM ${RModel.table} WHERE ${relationSql}${relSql ? ` AND ${relSql}` : ""})`
               );
            }
            if (relParts.length === 1) parts.push(relParts[0]);
            else if (relParts.length > 1) parts.push(`(${relParts.join(" OR ")})`);

            continue;
         }

         const columnName = `${model.table}.${col}`;

         // ✅ Array of subconditions → OR
         if (Array.isArray(val)) {
            const subParts: string[] = [];
            for (const subargs of val as any) {
               if (!isObject(subargs)) continue;
               const cond = this.condition(columnName, subargs);
               if (cond) subParts.push(`(${cond})`);
            }

            if (subParts.length) {
               parts.push(`(${subParts.join(" OR ")})`);
            }

            continue;
         }

         // ✅ Subcondition object
         if (isObject(val)) {
            const cond = this.condition(columnName, val);
            if (cond) parts.push(`(${cond})`);
            continue;
         }

         // ✅ Direct primitive
         parts.push(`${columnName} = ${this.format(col, val)}`);

      }

      this.parts = parts;
   }

   condition(column: string, subargs: WhereSubConditionArgs<any>) {
      const parts: string[] = [];

      for (const key in subargs) {
         const val = (subargs as any)[key];

         switch (key) {
            case "equals":
               parts.push(`${column} = ${this.format(column, val)}`);
               break;

            case "not":
               if (Array.isArray(val)) {
                  const notParts: string[] = [];
                  for (const v of val) {
                     if (isObject(v)) {
                        const cond = this.condition(column, v as WhereSubConditionArgs<any>);
                        if (cond) notParts.push(`(${cond})`);
                     } else {
                        notParts.push(`${column} = ${this.format(column, v)}`);
                     }
                  }
                  if (notParts.length) {
                     parts.push(`NOT (${notParts.join(" OR ")})`);
                  }
               } else if (isObject(val)) {
                  parts.push(`NOT (${this.condition(column, val)})`);
               } else {
                  parts.push(`${column} != ${this.format(column, val)}`);
               }
               break;

            case "lt":
               parts.push(`${column} < ${this.format(column, val)}`);
               break;

            case "lte":
               parts.push(`${column} <= ${this.format(column, val)}`);
               break;

            case "gt":
               parts.push(`${column} > ${this.format(column, val)}`);
               break;

            case "gte":
               parts.push(`${column} >= ${this.format(column, val)}`);
               break;

            case "in":
               if (val?.length) {
                  parts.push(
                     `${column} IN (${val.map((v: any) => this.format(column, v)).join(", ")})`
                  );
               }
               break;

            case "notIn":
               if (val?.length) {
                  parts.push(
                     `${column} NOT IN (${val.map((v: any) => this.format(column, v)).join(", ")})`
                  );
               }
               break;

            case "between":
               parts.push(
                  `${column} BETWEEN ${this.format(column, val[0])} AND ${this.format(column, val[1])}`
               );
               break;

            case "contains":
               parts.push(`${column} LIKE ${this.format(column, `%${val}%`)}`);
               break;

            case "startsWith":
               parts.push(`${column} LIKE ${this.format(column, `${val}%`)}`);
               break;

            case "endsWith":
               parts.push(`${column} LIKE ${this.format(column, `%${val}`)}`);
               break;

            case "is":
               parts.push(`${column} IS NULL`);
               break;

            case "isNot":
               parts.push(`${column} IS NOT NULL`);
               break;
         }
      }

      return parts.join(" AND ");
   }

   private format(column: string, value: any) {
      const model = this.model
      const schema = model.schema()
      const field = schema[column]
      try {
         let v = field.parse(value)
      } catch (error: any) {
         throw new XansqlError({
            code: "VALIDATION_ERROR",
            model: model.table,
            field: column,
            // sql: `WHERE ${parts.join(" AND ")}`,
            message: error.message
         });
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
