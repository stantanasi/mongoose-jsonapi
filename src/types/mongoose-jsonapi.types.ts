import { Document } from 'mongoose';
import { JsonApiResource } from './jsonapi.types';

export interface JsonApiInstanceMethods extends Document {
  toJsonApi: (
    opts: {
      baseUrl: string;
      meta?: any;
    },
  ) => {
    data: JsonApiResource;
    included: JsonApiResource[];
  }
}
