import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import { HydratedDocument, model, Model, Schema, Types } from 'mongoose'

export interface IPeople {
  _id: Types.ObjectId

  firstName: string
  lastName: string
  twitter: string | null

  createdAt: Date
  updatedAt: Date
}

export interface PeopleInstanceMethods extends JsonApiInstanceMethods { }

export interface PeopleQueryHelper extends JsonApiQueryHelper { }

export interface PeopleModel extends Model<IPeople, PeopleQueryHelper, PeopleInstanceMethods> { }

export const PeopleSchema = new Schema<IPeople, PeopleModel & JsonApiModel<IPeople>, PeopleInstanceMethods, PeopleQueryHelper>({
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


PeopleSchema.plugin(MongooseJsonApi, {
  type: 'people',
})


export type TPeople = HydratedDocument<IPeople, PeopleInstanceMethods, PeopleQueryHelper>

const People = model<IPeople, PeopleModel & JsonApiModel<IPeople>>('People', PeopleSchema)
export default People
