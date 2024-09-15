import { Document, HydratedDocument, Model, QueryWithHelpers } from 'mongoose';
import { JsonApiBody, JsonApiQueryParams, JsonApiResource } from './jsonapi.types';

export interface JsonApiModel<T> extends Model<T, JsonApiQueryHelper, JsonApiInstanceMethods> {
  fromJsonApi: (body: any) => HydratedDocument<T, JsonApiInstanceMethods>;
}

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

export interface JsonApiQueryHelper {
  getRelationship: <ResultType = any, DocType extends JsonApiInstanceMethods & Document = any>(
    this: QueryWithHelpers<DocType | null, DocType, JsonApiQueryHelper>,
    relationship: string,
  ) => QueryWithHelpers<ResultType, DocType, JsonApiQueryHelper>;

  withJsonApi: <DocType extends JsonApiInstanceMethods>(
    this: QueryWithHelpers<DocType | DocType[] | null, DocType, JsonApiQueryHelper>,
    query: JsonApiQueryParams,
  ) => this;

  toJsonApi: <DocType extends JsonApiInstanceMethods & Document>(
    this: QueryWithHelpers<DocType | DocType[] | null, DocType, JsonApiQueryHelper>,
    opts: {
      baseUrl: string;
      meta?: any;
    },
  ) => QueryWithHelpers<JsonApiBody, DocType, JsonApiQueryHelper>;

  paginate: <DocType>(
    this: QueryWithHelpers<JsonApiBody, DocType, JsonApiQueryHelper>,
    opts: {
      url: string;
      query: JsonApiQueryParams;
    },
  ) => this;
}
