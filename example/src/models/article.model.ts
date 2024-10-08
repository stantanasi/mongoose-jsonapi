import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'
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

export type ArticleInstanceMethods = JsonApiInstanceMethods

export type ArticleQueryHelper = JsonApiQueryHelper

export type ArticleModel = Model<IArticle, ArticleQueryHelper, ArticleInstanceMethods> & JsonApiModel<IArticle>

export const ArticleSchema = new Schema<IArticle, ArticleModel, ArticleInstanceMethods, ArticleQueryHelper>({
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

const Article = mongoose.model<IArticle, ArticleModel>('Article', ArticleSchema)
export default Article
