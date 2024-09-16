import { Document, HydratedDocument, Model, QueryWithHelpers, Types } from 'mongoose';
import { JsonApiBody, JsonApiQueryParams } from './jsonapi.types';

export interface JsonApiModel<T> extends Model<T, JsonApiQueryHelper, JsonApiInstanceMethods> {
  fromJsonApi: (body: any) => HydratedDocument<T, JsonApiInstanceMethods>;
}

export interface JsonApiInstanceMethods extends Document {
  toJsonApi: (
    opts: {
      baseUrl: string;
      meta?: any;
    },
  ) => JsonApiBody;

  merge: (...sources: any[]) => this;
}

export interface JsonApiQueryHelper {
  getRelationship: <
    P extends keyof RawDocType,
    DocType extends JsonApiInstanceMethods,
    THelpers extends JsonApiQueryHelper,
    TInstanceMethods extends JsonApiInstanceMethods,
    ResultType extends Exclude<RawDocType[P], Types.ObjectId | Types.ObjectId[] | undefined>,
    ResultDocType extends JsonApiInstanceMethods,
    ResultTHelpers extends JsonApiQueryHelper,
    ResultTInstanceMethods extends JsonApiInstanceMethods,
    RawDocType = DocType,
    QueryOp = 'find',
    ResultRawDocType = ResultDocType,
    ResultQueryOp = 'find',
  >(
    this: QueryWithHelpers<DocType | null, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>,
    relationship: P,
  ) => QueryWithHelpers<
    ResultType,
    ResultDocType,
    ResultTHelpers,
    ResultRawDocType,
    ResultQueryOp,
    ResultTInstanceMethods
  >;

  withJsonApi: <
    ResultType extends DocType | DocType[] | null,
    DocType extends JsonApiInstanceMethods,
    THelpers extends JsonApiQueryHelper,
    TInstanceMethods extends JsonApiInstanceMethods,
    RawDocType = DocType,
    QueryOp = 'find',
  >(
    this: QueryWithHelpers<ResultType, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>,
    query: JsonApiQueryParams,
  ) => this;

  toJsonApi: <
    ResultType extends DocType | DocType[] | null,
    DocType extends JsonApiInstanceMethods,
    THelpers extends JsonApiQueryHelper,
    TInstanceMethods extends JsonApiInstanceMethods,
    RawDocType = DocType,
    QueryOp = 'find',
  >(
    this: QueryWithHelpers<ResultType, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>,
    opts: {
      baseUrl: string;
      meta?: any;
    },
  ) => QueryWithHelpers<JsonApiBody, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>;

  paginate: <
    ResultType extends JsonApiBody,
    DocType extends JsonApiInstanceMethods,
    THelpers extends JsonApiQueryHelper,
    TInstanceMethods extends JsonApiInstanceMethods,
    RawDocType = DocType,
    QueryOp = 'find',
  >(
    this: QueryWithHelpers<ResultType, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>,
    opts: {
      url: string;
      query: JsonApiQueryParams;
    },
  ) => this;
}
