import XqlArray from "./fields/Array"
import XqlBoolean from "./fields/Boolean"
import XqlDate from "./fields/Date"
import XqlEnum from "./fields/Enum"
import XqlFile from "./fields/File"
import XqlIDField from "./fields/IDField"
import XqlNumber from "./fields/Number"
import XqlObject from "./fields/Object"
import XqlRecord from "./fields/Record"
import XqlString from "./fields/String"
import XqlTuple from "./fields/Tuple"
import XqlUnion from "./fields/Union"
import XqlSchema from "./fields/Schema"
import XqlIP from "./additional/IP"
import XqlName from "./additional/Name"
import XqlPassword from "./additional/Password"
import XqlPhone from "./additional/Phone"
import XqlPhoto from "./additional/Photo"
import XqlSlug from "./additional/Slug"
import XqlUrl from "./additional/Url"
import XqlUsername from "./additional/Username"
import { XVInstanceType } from "xanv"



export type XansqlSchemaObject = {
   [key: string]: XqlFields
}

export type XqlFields =
   | XqlIDField
   | XqlArray
   | XqlBoolean
   | XqlDate
   | XqlEnum<any>
   | XqlFile
   | XqlNumber
   | XqlObject
   | XqlRecord<XqlFields, XqlFields>
   | XqlString
   | XqlTuple<any>
   | XqlUnion<any>
   | XqlSchema<string, string>
   // additional
   | XqlIP
   | XqlName
   | XqlPassword
   | XqlPhone
   | XqlPhoto
   | XqlSlug
   | XqlUrl
   | XqlUsername




export type XqlFieldInstance<T extends XqlFields> = T extends XVInstanceType ? T : never;



export type Infer<T> =
   T extends XqlIDField ? string :
   T extends XqlArray<infer U> ? Infer<U>[] :
   T extends XqlBoolean ? boolean :
   T extends XqlDate ? Date :
   T extends XqlEnum<infer U> ? U[number] :
   T extends XqlFile ? File | Blob :
   T extends XqlNumber ? number :
   T extends XqlObject<infer O> ? { [K in keyof O]: Infer<O[K]> } :
   // T extends XqlRecord<infer K, infer V> ? Record<Infer<K>, Infer<V>> :
   T extends XqlString ? string :
   // T extends XqlTuple<infer U extends XqlFields[]> ? { [K in keyof U]: Infer<U[K]> } :
   // T extends XqlUnion<infer U extends XqlFields[]> ? Infer<U[number]> :
   T extends XqlSchema<infer T, infer C> ? { table: T, column: C } :
   // additional fields
   T extends XqlIP ? string :
   T extends XqlName ? string :
   T extends XqlPassword ? string :
   T extends XqlPhone ? string :
   T extends XqlPhoto ? File | Blob :
   T extends XqlSlug ? string :
   T extends XqlUrl ? string :
   T extends XqlUsername ? string :
   any;
