import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'
import { TArticle } from './article.model'
import { TPeople } from './people.model'

export interface IComment {
  _id: Types.ObjectId

  body: string

  article: Types.ObjectId | TArticle
  author: Types.ObjectId | TPeople

  createdAt: Date
  updatedAt: Date
}

export type CommentInstanceMethods = JsonApiInstanceMethods

export type CommentQueryHelper = JsonApiQueryHelper

export type CommentModel = Model<IComment, CommentQueryHelper, CommentInstanceMethods> & JsonApiModel<IComment>

export const CommentSchema = new Schema<IComment, CommentModel, CommentInstanceMethods, CommentQueryHelper>({
  body: {
    type: String,
    required: true,
  },


  article: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
    required: true,
  },

  author: {
    type: Schema.Types.ObjectId,
    ref: 'Author',
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


CommentSchema.plugin(MongooseJsonApi, {
  type: 'comments',
})


export type TComment = HydratedDocument<IComment, CommentInstanceMethods, CommentQueryHelper>

const Comment = mongoose.model<IComment, CommentModel>('Comment', CommentSchema)
export default Comment
