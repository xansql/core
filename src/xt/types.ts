
import { XVType } from "xanv"
import XqlArray from "./fields/Array";
import XqlSchema from "./fields/Schema";

export type XqlField = XVType<any>
export type XqlSchemaShape = Record<string, XqlField>;
