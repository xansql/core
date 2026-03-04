import { Model, Xansql, xt } from "../src";
import { XansqlBridgeDialect } from "@xansql/bridge";
import { ProductMetaModel, ProductModel, UserMetaModel, UserModel } from "./Schema";

const bridge = XansqlBridgeDialect("http://localhost:1234/data") as any

export const db = new Xansql({
   dialect: bridge
})

export const User = db.model(UserModel)
export const UserMeta = db.model(UserMetaModel)
export const Product = db.model(ProductModel)
export const ProductMeta = db.model(ProductMetaModel)