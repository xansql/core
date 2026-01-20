import { XVInstanceType } from "xanv";
import XqlString from "./fields/String";
import XqlBoolean from "./fields/Boolean";
import XqlArray from "./fields/Array";
import XqlDate from "./fields/Date";
import XqlEnum from "./fields/Enum";
import XqlNumber from "./fields/Number";
import XqlObject from "./fields/Object";
import XqlRecord from "./fields/Record";
import XqlTuple from "./fields/Tuple";
import XqlUnion from "./fields/Union";
import XqlIDField from "./fields/IDField";
import XqlFile from "./fields/File";
import XqlSchema from "./fields/Schema";
import { XqlFields } from "./types";
import XqlName from "./additional/Name";
import XqlPassword from "./additional/Password";
import XqlUsername from "./additional/Username";
import XqlSlug from "./additional/Slug";
import XqlUrl from "./additional/Url";
import XqlPhoto from "./additional/Photo";
import XqlPhone from "./additional/Phone";
import XqlIP from "./additional/IP";
import { XVObjectShape } from "xanv/types/Object";

const xt = {
   id: () => new XqlIDField(),
   array: <T extends XqlFields>(type: T, length?: number) => new XqlArray(type, length),
   boolean: () => new XqlBoolean(),
   date: () => new XqlDate(),
   enum: <T extends readonly (string | number)[]>(...values: T) => new XqlEnum<T>(values),
   number: (length?: number) => new XqlNumber(length),
   object: <T extends XVObjectShape>(arg?: T) => new XqlObject<T>(arg),
   record: <K extends XVInstanceType, V extends XVInstanceType>(key: K, value: V) => new XqlRecord(key as any, value as any),
   string: (length?: number) => new XqlString(length),
   tuple: (type: XqlFields[]) => new XqlTuple(type),
   union: <T extends XqlFields[]>(types: T) => new XqlUnion(types as any),
   file: (size?: number) => new XqlFile(size),
   schema: <T extends string, C extends string>(table: T, column: C) => new XqlSchema(table, column),

   createdAt: () => xt.date().create(),
   updatedAt: () => xt.date().update(),
   // Custom Types
   name: () => new XqlName,
   password: () => new XqlPassword,
   email: () => xt.string().email().index().unique(),
   status: <T extends readonly (string | number)[]>(...values: T) => xt.enum<T>(...values).index(),
   gender: () => xt.enum('male', 'female', 'other').index(),
   role: (roles: string[]) => xt.enum(...roles).index(),
   username: () => new XqlUsername,
   slug: () => new XqlSlug,
   url: () => new XqlUrl,
   photo: () => new XqlPhoto,
   amount: () => xt.number().float().min(0).max(1000000000),
   phone: () => new XqlPhone,
   title: () => xt.string().min(1).max(200),
   description: () => xt.string().max(1000),
   type: (types: string[]) => xt.enum(...types).index(),
   metadata: () => xt.record(
      xt.string(),
      xt.union([
         xt.string(),
         xt.number(),
         xt.boolean(),
         xt.date()
      ])
   ),
   ip: () => new XqlIP,
   key: () => xt.string().max(100).index().unique(),
   value: () => xt.string().max(1000),
   token: () => xt.string(64).index().unique(),
}

export default xt;