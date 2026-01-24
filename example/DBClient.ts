import { Xansql } from '../src'
import { XansqlBridgeDialect } from '@xansql/bridge';
import { ProductCategorySchema, ProductMetaSchema, ProductModelSchema, UserModelMetaSchema, UserModelSchema } from './Schema';

export const db = new Xansql({
   dialect: XansqlBridgeDialect("http://localhost:4000/data"),
})

export const UserModel = db.model(UserModelSchema)
export const ProductModel = db.model(ProductModelSchema)
export const ProductCategory = db.model(ProductCategorySchema)
export const UserModelMeta = db.model(UserModelMetaSchema)
export const ProductMetaModel = db.model(ProductMetaSchema)
