import { xt } from "../src";



export const UserModelMetaSchema = {
   uoid: xt.id(),
   meta_key: xt.string(),
   meta_value: xt.string(),
}

export const UserModelSchema = {
   uid: xt.id(),
   name: xt.string(),
   username: xt.username().nullable(),
   photo: xt.photo().nullable(),
   email: xt.email(),
   password: xt.password(),
   float_val: xt.number().float().nullable(),
   metas: xt.array(xt.schema("user_metas", "user")),
   products: xt.array(xt.schema("products", "user")),
   created_at: xt.createdAt(),
   updated_at: xt.updatedAt(),
}

export const ProductModelSchema = {
   pid: xt.id(),
   name: xt.string().index().nullable(),
   description: xt.string(),
   price: xt.string(),
   disoucnt_price: xt.string().default(() => "100"),
   // categories: xt.many(ProductCategorySchema),
   user: xt.schema("users", "products"),
}


export const ProductCategorySchema = {
   pcid: xt.id(),
   name: xt.string().index(),
   description: xt.string().nullable(),
   // post: xt.schema('products', "categories"),
   post: xt.one(ProductModelSchema),
}

export const ProductMetaSchema = {
   pmid: xt.id(),
   product: xt.schema("products", "metas").nullable(),
   meta_key: xt.string(),
   meta_value: xt.string(),
}
