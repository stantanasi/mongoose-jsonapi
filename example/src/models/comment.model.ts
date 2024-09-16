import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose'

export interface IComment {
  _id: Types.ObjectId

  body: string

  createdAt: Date
  updatedAt: Date
}

export interface CommentInstanceMethods extends JsonApiInstanceMethods { }

export interface CommentQueryHelper extends JsonApiQueryHelper { }

export interface CommentModel extends Model<IComment, CommentQueryHelper, CommentInstanceMethods> { }

export const CommentSchema = new Schema<IComment, CommentModel & JsonApiModel<IComment>, CommentInstanceMethods, CommentQueryHelper>({
  body: {
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


CommentSchema.plugin(MongooseJsonApi, {
  type: 'comments',
})


export type TComment = HydratedDocument<IComment, CommentInstanceMethods, CommentQueryHelper>

const Comment = model<IComment, CommentModel & JsonApiModel<IComment>>('Comment', CommentSchema)
export default Comment
