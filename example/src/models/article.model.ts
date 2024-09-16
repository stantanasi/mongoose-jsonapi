import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose'

export interface IArticle {
  _id: Types.ObjectId

  title: string

  createdAt: Date
  updatedAt: Date
}

export interface ArticleInstanceMethods extends JsonApiInstanceMethods { }

export interface ArticleQueryHelper extends JsonApiQueryHelper { }

export interface ArticleModel extends Model<IArticle, ArticleQueryHelper, ArticleInstanceMethods> { }

export const ArticleSchema = new Schema<IArticle, ArticleModel & JsonApiModel<IArticle>, ArticleInstanceMethods, ArticleQueryHelper>({
  title: {
    type: String,
    required: true,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})


ArticleSchema.plugin(MongooseJsonApi, {
  type: 'articles',
})


export type TArticle = HydratedDocument<IArticle, ArticleInstanceMethods, ArticleQueryHelper>

const Article = model<IArticle, ArticleModel & JsonApiModel<IArticle>>('Article', ArticleSchema)
export default Article
