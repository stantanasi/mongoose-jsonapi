import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'
import { TArticle } from './article.model'
import { TComment } from './comment.model'

export interface IPeople {
  _id: Types.ObjectId

  firstName: string
  lastName: string
  twitter: string | null

  articles?: TArticle[]
  comments?: TComment[]

  createdAt: Date
  updatedAt: Date
}

export type PeopleInstanceMethods = JsonApiInstanceMethods

export type PeopleQueryHelper = JsonApiQueryHelper

export type PeopleModel = Model<IPeople, PeopleQueryHelper, PeopleInstanceMethods> & JsonApiModel<IPeople>

export const PeopleSchema = new Schema<IPeople, PeopleModel, PeopleInstanceMethods, PeopleQueryHelper>({
  firstName: {
    type: String,
    required: true,
  },

  lastName: {
    type: String,
    required: true,
  },

  twitter: {
    type: String,
    default: null,
  },
}, {
  id: false,
  versionKey: false,
  timestamps: true,
  minimize: false,
  toJSON: { virtuals: true },
  toObject: { virtuals: true },
})

PeopleSchema.virtual('articles', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'author',
})

PeopleSchema.virtual('comments', {
  ref: 'Comment',
  localField: '_id',
  foreignField: 'author',
})


PeopleSchema.plugin(MongooseJsonApi, {
  type: 'people',
})


export type TPeople = HydratedDocument<IPeople, PeopleInstanceMethods, PeopleQueryHelper>

const People = mongoose.model<IPeople, PeopleModel>('People', PeopleSchema)
export default People
