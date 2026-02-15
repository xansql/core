import Schema from "../core/Schema"

export type SchemaShape<S extends Schema> = ReturnType<S["schema"]>

export type SchemaColumnList<S extends Schema> = {
   [column in keyof SchemaShape<S> as SchemaShape<S>[column] extends { isRelation: true } ? never : column]: SchemaShape<S>[column]
}

export type SchemaRelationColumnList<S extends Schema> = {
   [column in keyof SchemaShape<S> as SchemaShape<S>[column] extends { isRelation: true } ? column : never]: SchemaShape<S>[column]
}