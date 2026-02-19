import Model from "."
import { XqlField } from "../xt/types"

export type SchemaShape = Record<string, XqlField>

export type SchemaColumnList<S extends SchemaShape> = {
   [column in keyof S as S[column] extends { isRelation: true } ? never : column]: S[column]
}

export type SchemaRelationColumnList<S extends SchemaShape> = {
   [column in keyof S as S[column] extends { isRelation: true } ? column : never]: S[column]
}


export type SelectArgs<S extends SchemaShape = any> = {
   [column in keyof S]?: boolean | SelectArgs<any>
}

export type FindArgs<S extends SchemaShape = any> = {
   where?: Partial<S>,
   select?: SelectArgs<S>
}