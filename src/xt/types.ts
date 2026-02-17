
import { XVType } from "xanv"
import xt from ".";
import RelationMany from "./fields/RelationMany";
import RelationOne from "./fields/RelationOne";

export type XqlField =
   | XVType<any>
   | RelationMany<any>
   | RelationOne<any>


export type XqlSchemaShape = Record<string, any>;
export type XT = typeof xt