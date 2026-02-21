import { Infer } from "xanv"
import Model from "."
import XqlRelationMany from "../xt/fields/RelationMany"
import XqlRelationOne from "../xt/fields/RelationOne"
import { XqlField } from "../xt/types"
import XqlIDField from "../xt/fields/IDField"

export type SchemaShape = Record<string, XqlField>
export type ModelClass<M extends Model<any>> = new (...args: any[]) => M
type Normalize<T> = T extends object ? { [K in keyof T]: T[K] } : T

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
export type DistinctArgs<S extends SchemaShape> = Normalize<(keyof SchemaAllColumns<S>)[]>

export type LimitArgs = {
   take?: number;
   skip?: number;
}

export type OrderByArgs<S extends SchemaShape> = Normalize<{
   [C in keyof S as S[C] extends XqlRelationMany<any> ? never : C]?: "asc" | "desc";
}>


// WHERE 
export interface WhereSubConditionArgs<V> {
   equals?: V;
   not?: V;
   lt?: V;
   lte?: V;
   gt?: V;
   gte?: V;
   in?: (V)[];
   notIn?: (V)[];
   between?: [V, V];
   notBetween?: [V, V];
   contains?: V;
   notContains?: V;
   startsWith?: V;
   endsWith?: V;
   isNull?: boolean;
   isNotNull?: boolean;
   isEmpty?: boolean;
   isNotEmpty?: boolean;
   isTrue?: boolean;
   isFalse?: boolean;
}

export type WhereColumnArgs<F extends XqlField> = Infer<F> | WhereSubConditionArgs<Infer<F>> | WhereSubConditionArgs<Infer<F>>[]

export type WhereLogical<S extends SchemaShape> = {
   AND?: WhereArgs<S>[]
   OR?: WhereArgs<S>[]
   NOT?: WhereArgs<S>[]
}

export type WhereArgs<S extends SchemaShape> = {
   [C in keyof S]?: S[C] extends { isRelation: true, schema: SchemaShape } ? (Normalize<WhereArgs<S[C]['schema']>> | Normalize<WhereArgs<S[C]['schema']>>[]) : Normalize<WhereColumnArgs<S[C]>>
} | WhereLogical<S>

//    SELECT ARGS
export type SelectArgs<S extends SchemaShape = SchemaShape> = Normalize<{
   [C in keyof S]?: S[C] extends { isRelation: true; schema: SchemaShape } ? boolean | Normalize<FindArgs<S[C]['schema']>> : boolean
}>


// FIND ARGS
export type FindAggregateArgs<S extends SchemaShape> = Normalize<{
   [K in keyof S as IsRelationMany<S[K]> extends true ? K : never]?: {
      [C in keyof S as S[C] extends { isRelation: true } ? never : C]?: AggregateArgsValue
   }
}>


// FIND ARGS
export type FindArgs<S extends SchemaShape = SchemaShape> = {
   distinct?: DistinctArgs<S>
   where?: WhereArgs<S> | WhereArgs<S>[]
   select?: SelectArgs<S>
   limit?: LimitArgs
   orderBy?: OrderByArgs<S>;
   aggregate?: FindAggregateArgs<S>
}


// CREATE ARGS
export type CreateDataValue<F extends XqlField> =
   F extends XqlRelationOne<any> ? number :
   F extends { type: "relation-many", schema: SchemaShape } ? CreateDataArgs<F['schema']> | CreateDataArgs<F['schema']>[] :
   Infer<F>

export type CreateDataArgs<S extends SchemaShape> = {
   [
   C in keyof S as
   S[C] extends XqlIDField ? never :
   S[C]['meta'] extends { create: true } ? never :
   S[C]['meta'] extends { update: true } ? never : C
   ]: CreateDataValue<S[C]>
}

export type CreateArgs<S extends SchemaShape> = {
   data: CreateDataArgs<S> | CreateDataArgs<S>[];
   select?: SelectArgs<S>
}


// UPDATE ARGS
export type UpdateDataValue<F extends XqlField> =
   F extends XqlRelationOne<any> ? number :
   F extends { type: "relation-many", schema: SchemaShape } ? UpdateArgs<F['schema']> :
   Infer<F>

export type UpdateDataArgs<S extends SchemaShape> = {
   [
   C in keyof S as
   S[C] extends XqlIDField ? never :
   S[C]['meta'] extends { create: true } ? never :
   S[C]['meta'] extends { update: true } ? never : C
   ]?: UpdateDataValue<S[C]>
}

export type UpdateArgs<S extends SchemaShape> = {
   data: UpdateDataArgs<S>;
   where: WhereArgs<S> | WhereArgs<S>[]
}

// UPSERT
export type UpsertArgs<S extends SchemaShape> = {
   create: CreateDataArgs<S>;
   update: CreateDataArgs<S>;
   where: WhereArgs<S> | WhereArgs<S>[]
}

// DELETE ARGS
export type DeleteArgs<S extends SchemaShape> = {
   where: WhereArgs<S> | WhereArgs<S>[];
   select?: SelectArgs<S>;
}