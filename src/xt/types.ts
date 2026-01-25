
import { XVType } from "xanv"
import XqlArray from "./fields/Array";
import XqlSchema from "./fields/Schema";

export type XqlField = XVType<any>
export type XansqlSchemaObject = Record<string, XqlField>;

export type XqlSchemaShape = Record<string, XqlField>;

export type IsArraySchema<T> = T extends XqlArray<infer U> ? U extends XqlSchema<any, any> ? never : "ow" : "ow";

export type InferValue<T extends XVType<any>> =
   T extends { _type: infer R } ? (T["meta"] extends { nullable: true } ? R | null : R) : never

// optional field detection
export type IsOptional<T extends XVType<any>> =
   T["meta"] extends { optional: true } ? true :
   T["meta"] extends { default: any } ? true :
   T extends XqlSchema<any, any> ? true :
   T extends XqlArray<XqlSchema<any, any>> ? true :
   false;

// object schema inference
export type InferObject<T extends Record<string, XVType<any>>> =
   { [K in keyof T as IsOptional<T[K]> extends true ? never : K]: InferValue<T[K]> } &
   { [K in keyof T as IsOptional<T[K]> extends true ? K : never]?: InferValue<T[K]> }

// 🔥 THIS is what you use
type Simplify<T> = T extends object ? { [K in keyof T]: T[K] } : T

export type InferSchema<T> =
   T extends Record<string, XVType<any>> ? Simplify<InferObject<T>> :
   T extends { _type: infer R } ? R : never


