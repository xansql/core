import { Infer, XVType } from "xanv"
import Model from "."
import XqlRelationMany from "../xt/fields/RelationMany"
import XqlRelationOne from "../xt/fields/RelationOne"
import { XqlField } from "../xt/types"
import XqlIDField from "../xt/fields/IDField"


export type ExactArgs<T, Shape> =
   T extends object
   ? Shape extends object
   ? Exclude<keyof T, keyof Shape> extends never
   ? {
      [K in keyof T]: K extends keyof Shape
      ? T[K] extends object
      ? ExactArgs<T[K], Shape[K]>
      : T[K]
      : never
   }
   : Shape
   : never
   : T;

export type SchemaShape = Record<string, XqlField>
export type ModelClass<M extends Model<any>> = new (...args: any[]) => M
export type Normalize<T> = T extends object ? { [K in keyof T]: T[K] } : T

export type SchemaAllColumns<S extends SchemaShape> = {
   [column in keyof S as S[column] extends XqlRelationMany<any> ? never : column]: S[column]
}

export type IsRelationField<F extends XqlField> = F extends { isRelation: true } ? true : false
export type IsRelationOne<F extends XqlField> = F extends XqlRelationOne<any> ? true : false
export type IsRelationMany<F extends XqlField> = F extends XqlRelationMany<any> ? true : false


export type AggregateFunctions = "count" | "sum" | "avg" | "min" | "max"
export type AggregateArgsValue = {
   [func in AggregateFunctions]?: boolean | {
      orderBy?: "asc" | "desc";
      round?: number;
      distinct?: boolean;
   }
}
export type GropuByArgs<S extends SchemaShape> = Normalize<(keyof SchemaAllColumns<S>)[]>

export type LimitArgs = {
   take: number;
   skip?: number;
}

export type OrderByArgs<S extends SchemaShape> = Normalize<{
   [C in keyof S as S[C] extends XqlRelationMany<any> ? never : C]?: "asc" | "desc";
}>


// WHERE 
export type WhereSubConditionArgs<T> = {
   is?: T | null;
   not?: T | null | WhereSubConditionArgs<T> | WhereSubConditionArgs<T>[];

   lt?: T extends number | Date ? T : never;
   lte?: T extends number | Date ? T : never;
   gt?: T extends number | Date ? T : never;
   gte?: T extends number | Date ? T : never;

   in?: T[];
   notIn?: T[];

   between?: T extends number | Date ? [T, T] : never;

   contains?: T extends string ? string : never;
   startsWith?: T extends string ? string : never;
   endsWith?: T extends string ? string : never;


}

export type InferWhereValue<T extends XVType<any>> = T extends { _type: infer R } ? R : never
export type WhereColumnArgs<F extends XqlField> = InferWhereValue<F> | WhereSubConditionArgs<InferWhereValue<F>> | WhereSubConditionArgs<InferWhereValue<F>>[];

export type WhereArgs<S extends SchemaShape> = Normalize<{
   [C in keyof S]?: S[C] extends { isRelation: true, schema: SchemaShape } ? (Normalize<WhereArgs<S[C]['schema']>> | Normalize<WhereArgs<S[C]['schema']>>[]) : Normalize<WhereColumnArgs<S[C]>>
}> | WhereArgs<S>[]

// SELECT ARGS
export type SelectArgs<S extends SchemaShape = SchemaShape> = Normalize<{
   [C in keyof S]?: S[C] extends { isRelation: true; schema: SchemaShape } ? boolean | Normalize<FindArgs<S[C]['schema']>> : boolean
}>


// AGGREGATE ARGS
export type AggregateSelectArgs<S extends SchemaShape> = {
   [C in keyof S  as S[C] extends { isRelation: true } ? never : C]?: AggregateArgsValue
}

export type AggregateGroupByArgs<S extends SchemaShape> = (keyof SchemaAllColumns<S>)[]

export type AggregateArgs<S extends SchemaShape> = {
   groupBy?: AggregateGroupByArgs<S>;
   orderBy?: OrderByArgs<S>;
   limit?: LimitArgs;
   where?: WhereArgs<S>;
   select: AggregateSelectArgs<S>
}

// FIND ARGS
export type FindAggregateArgs<S extends SchemaShape> = Normalize<{
   [K in keyof S as S[K] extends { type: "relation-many", schema: SchemaShape } ? K : never]?: S[K] extends { type: "relation-many", schema: SchemaShape } ? Normalize<AggregateSelectArgs<S[K]["schema"]>> : never
}>


// FIND ARGS

export type FindArgs<S extends SchemaShape> = {
   distinct?: boolean;
   groupBy?: GropuByArgs<S>
   where?: WhereArgs<S>
   select?: SelectArgs<S>
   limit?: LimitArgs
   orderBy?: OrderByArgs<S>;
   aggregate?: FindAggregateArgs<S>
}

// Fix FindResult so missing select returns full shape
export type FindResultFullSchema<S extends SchemaShape> = {
   [K in keyof S as S[K] extends { isRelation: true } ? never : K]: Infer<S[K]>
}

export type FindResultColumnMap<T extends FindArgs<any>, S extends SchemaShape> = {
   [K in keyof T['select'] & keyof S as T['select'][K] extends any ?
   (
      S[K] extends { isRelation: true } ? never : K
   ) :
   never]: true
}

export type FindResultMap<T extends FindArgs<any>, S extends SchemaShape> = {
   [C in keyof S as S[C] extends XqlIDField ? C : never]: number
} & {
   [K in keyof T['select'] & keyof S as T['select'][K] extends any ? K : never]: (
      S[K] extends { type: "relation-many", schema: SchemaShape } ? (
         T['select'][K] extends FindArgs<any> ? (
            keyof T['select'][K] extends never ? Normalize<FindResultFullSchema<S[K]['schema']>> : FindResult<T["select"][K], S[K]['schema']>[]
         ) : Normalize<FindResultFullSchema<S[K]['schema']>>[]
      ) :
      S[K] extends { type: "relation-one", schema: SchemaShape } ? (
         T['select'][K] extends FindArgs<any> ? (
            keyof T['select'][K] extends never ? Normalize<FindResultFullSchema<S[K]['schema']>> : FindResult<T["select"][K], S[K]['schema']>
         ) : Normalize<FindResultFullSchema<S[K]['schema']>>
      ) :
      Infer<S[K]>
   )
}

export type FindResult<T extends FindArgs<any>, S extends SchemaShape> =
   Normalize<keyof T['select'] extends never ? Normalize<FindResultFullSchema<S>> :
      keyof FindResultColumnMap<T, S> extends never ? Normalize<FindResultFullSchema<S>> & Normalize<FindResultMap<T, S>> :
      Normalize<FindResultMap<T, S>>>




// CREATE ARGS
export type CreateDataValue<F extends XqlField> =
   F extends XqlRelationOne<any> ? number :
   F extends { type: "relation-many", schema: SchemaShape, targetColumn: string } ? CreateArgs<Omit<F['schema'], F['targetColumn']>>['data'] :
   Infer<F>

export type CreateDataArgs<S extends SchemaShape> = Normalize<{
   [
   C in keyof S as
   S[C] extends XqlIDField ? never :
   S[C] extends XqlRelationMany<any> ? never :
   S[C]['meta'] extends { nullable: true } ? never :
   S[C]['meta'] extends { createAt: true } ? never :
   S[C]['meta'] extends { updateAt: true } ? never : C
   ]: CreateDataValue<S[C]>
} & {
   [
   C in keyof S as
   S[C] extends XqlRelationMany<any> ? C :
   S[C]['meta'] extends { nullable: true } ? C : never
   ]?: CreateDataValue<S[C]>
}>

export type CreateArgs<S extends SchemaShape> = {
   data: CreateDataArgs<S> | CreateDataArgs<S>[];
   select?: SelectArgs<S>
}


// UPDATE ARGS
export type UpdateDataValue<F extends XqlField> =
   F extends XqlRelationOne<any> ? number :
   F extends { type: "relation-many", schema: SchemaShape } ? UpdateArgs<F['schema']> :
   Infer<F>

export type UpdateDataArgs<S extends SchemaShape> = Normalize<{
   [
   C in keyof S as
   S[C] extends XqlIDField ? never :
   S[C]['meta'] extends { create: true } ? never :
   S[C]['meta'] extends { update: true } ? never : C
   ]?: UpdateDataValue<S[C]>
}>

export type UpdateArgs<S extends SchemaShape> = {
   data: UpdateDataArgs<S>;
   where: WhereArgs<S>
}

// UPSERT
export type UpsertArgs<S extends SchemaShape> = {
   create: CreateDataArgs<S>;
   update: CreateDataArgs<S>;
   where: WhereArgs<S>
}

// DELETE ARGS
export type DeleteArgs<S extends SchemaShape> = {
   where: WhereArgs<S>;
   select?: SelectArgs<S>;
}