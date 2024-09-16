import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose'
import { TComment } from './comment.model'
import { TPeople } from './people.model'

export interface IArticle {
  _id: Types.ObjectId

  title: string

  author: Types.ObjectId | TPeople
  comments?: TComment[]

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


  author: {
    type: Schema.Types.ObjectId,
    ref: 'People',
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

ArticleSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'article',
})


ArticleSchema.plugin(MongooseJsonApi, {
  type: 'articles',
})


export type TArticle = HydratedDocument<IArticle, ArticleInstanceMethods, ArticleQueryHelper>

const Article = model<IArticle, ArticleModel & JsonApiModel<IArticle>>('Article', ArticleSchema)
export default Article
