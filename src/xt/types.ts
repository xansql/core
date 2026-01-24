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



// export type XansqlSchemaObject = {
//    [key: string]: XqlFields
// }

// export type XqlFields =
//    | XqlIDField
//    | XqlArray
//    | XqlBoolean
//    | XqlDate
//    | XqlEnum<any>
//    | XqlFile
//    | XqlNumber
//    | XqlObject
//    | XqlRecord<XqlFields, XqlFields>
//    | XqlString
//    | XqlTuple<any>
//    | XqlUnion<any>
//    | XqlSchema<string, string>
//    // additional
//    | XqlIP
//    | XqlName
//    | XqlPassword
//    | XqlPhone
//    | XqlPhoto
//    | XqlSlug
//    | XqlUrl
//    | XqlUsername
