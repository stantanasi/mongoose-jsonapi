import { Document, HydratedDocument, Model, QueryWithHelpers } from 'mongoose';
import { JsonApiBody, JsonApiQueryParams, JsonApiResource } from './jsonapi.types';

export interface JsonApiModel<T> extends Model<T, JsonApiQueryHelper, JsonApiInstanceMethods> {
  fromJsonApi(body: any): HydratedDocument<T, JsonApiInstanceMethods>;
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
  withJsonApi: <ResultType extends DocType | DocType[] | null, DocType extends JsonApiInstanceMethods>(
    this: QueryWithHelpers<ResultType, DocType, JsonApiQueryHelper>,
    query: JsonApiQueryParams,
  ) => this;

  toJsonApi: <ResultType extends DocType | DocType[] | null, DocType extends JsonApiInstanceMethods & Document>(
    this: QueryWithHelpers<ResultType, DocType, JsonApiQueryHelper>,
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
