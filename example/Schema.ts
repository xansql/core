import { Infer } from "xanv";
import { InferSchema, xt } from "../src";

export const ProductCategorySchema = {
   pcid: xt.id(),
   name: xt.string().index(),
   description: xt.string().optional(),
   post: xt.schema('products', "categories"),
}

export const UserModelMetaSchema = {
   uoid: xt.id(),
   meta_key: xt.string(),
   meta_value: xt.string(),
}

export const UserModelSchema = {
   uid: xt.id(),
   name: xt.string(),
   username: xt.username().optional(),
   photo: xt.photo().optional(),
   email: xt.email(),
   password: xt.password(),
   metas: xt.array(xt.schema("user_metas", "user")),
   products: xt.array(xt.schema("products", "user")),
   product: xt.schema("products", "user_product"),
   created_at: xt.createdAt(),
   updated_at: xt.updatedAt(),
}

export const ProductModelSchema = {
   pid: xt.id(),
   name: xt.string().index().optional(),
   description: xt.string(),
   price: xt.string(),
   disoucnt_price: xt.string().default(() => "100"),
   categories: xt.array(xt.schema("categories", "post")),
   user: xt.schema("users", "products"),
}

export const ProductMetaSchema = {
   pmid: xt.id(),
   product: xt.schema("products", "metas"),
   meta_key: xt.string(),
   meta_value: xt.string(),
}
