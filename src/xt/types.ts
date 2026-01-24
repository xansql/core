
import { XVType } from "xanv"


export type XqlField = XVType<any>

export type XansqlSchemaObject = Record<string, XqlField>;
