import { Document, FilterQuery, HydratedDocument, Model, PopulateOptions, QueryWithHelpers, Schema, SchemaType, Types, VirtualType } from 'mongoose'
import { JsonApiBody, JsonApiQueryParams, JsonApiResource } from '../types/jsonapi.types'
import UrlQuery from '../utils/url-query.utils'
import { JsonApiError } from './jsonapi-error'

export interface JsonApiModel<T> extends Model<T, JsonApiQueryHelper, JsonApiInstanceMethods> {
  fromJsonApi: (
    this: JsonApiModel<T>,
    body: JsonApiBody<JsonApiResource>,
  ) => HydratedDocument<T, JsonApiInstanceMethods>
}

export interface JsonApiInstanceMethods extends Document {
  toJsonApi: (
    opts: {
      baseUrl: string
      meta?: Record<string, any>
    },
  ) => JsonApiBody<JsonApiResource>

  merge: (...sources: (Record<string, any> | Document)[]) => this
}

export interface JsonApiQueryHelper {
  getRelationship: <
    P extends keyof RawDocType,
    DocType extends JsonApiInstanceMethods,
    THelpers extends JsonApiQueryHelper,
    TInstanceMethods extends JsonApiInstanceMethods,
    ResultType extends Exclude<RawDocType[P], string | string[] | Types.ObjectId | Types.ObjectId[] | undefined>,
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
  >

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
  ) => this

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
      baseUrl: string
      meta?: any
    },
  ) => QueryWithHelpers<
    JsonApiBody<ResultType extends Array<DocType> ? JsonApiResource[] : (JsonApiResource | null)>,
    DocType,
    THelpers,
    RawDocType,
    QueryOp,
    TInstanceMethods
  >

  paginate: <
    DocType extends JsonApiInstanceMethods,
    THelpers extends JsonApiQueryHelper,
    TInstanceMethods extends JsonApiInstanceMethods,
    RawDocType = DocType,
    QueryOp = 'find',
  >(
    this: QueryWithHelpers<JsonApiBody<JsonApiResource[]>, DocType, THelpers, RawDocType, QueryOp, TInstanceMethods>,
    opts: {
      url: string
      query: JsonApiQueryParams
    },
  ) => this
}


type MongooseJsonApiOptions<DocType> = {
  type: string
  filter?: {
    [field: string]: (value: string) => FilterQuery<DocType>
  }
}

export default function MongooseJsonApi<DocType, M extends JsonApiModel<DocType>>(
  _schema: Schema<DocType, M>,
  options: MongooseJsonApiOptions<DocType>,
) {
  const schema = _schema as Schema<DocType, M, JsonApiInstanceMethods, JsonApiQueryHelper, {}, JsonApiModel<DocType>>


  schema.statics.fromJsonApi = function (body) {
    const doc: any = {}

    if (body.data?.id) {
      doc._id = body.data.id
    }

    if (body.data?.attributes) {
      Object.assign(doc, body.data.attributes)
    }

    if (body.data?.relationships) {
      Object.entries(body.data.relationships)
        .forEach(([key, value]) => {
          if (Array.isArray(value.data)) {
            doc[key] = value.data.map((d) => d.id)
          } else if (value.data) {
            doc[key] = value.data.id
          }
        })
    }

    return new this(doc)
  }

  schema.query.getRelationship = function (relationship) {
    this.setOptions({
      getRelationship: relationship,
    })

    this.populate(relationship as string)

    return this.transform((doc) => {
      return doc?.get(relationship) ?? null
    }) as any
  }

  schema.query.withJsonApi = function (query) {
    if (this.getOptions().getRelationship) {
      this.populate({
        path: this.getOptions().getRelationship,

        // Filtering
        match: query.filter ? {
          $and: Object.entries(query.filter)
            .map(([field, values]) => {
              return {
                $or: values.split(',')
                  .map((value: string) => {
                    if (options.filter?.[field]) {
                      return options.filter[field](value)
                    } else {
                      return { [field]: value }
                    }
                  })
              }
            })
        } : undefined,

        // Inclusion of Related Resources
        populate: query.include
          ?.split(',')
          .map(includes => includes.split('.'))
          .reduce((acc, includes) => {
            includes.reduce((acc2, include) => {
              let index = acc2.findIndex(relationship => relationship.path === include)
              if (index === -1) {
                index = acc2.push({
                  path: include,
                  populate: [],
                  // // TODO: implement JSON:API Sparse Fieldsets (eg. fields[type]=....)
                  // select: query.fields?.[type]
                  //   ?.split(',')
                  //   .reduce((acc, field) => {
                  //     acc[field] = 1
                  //     return acc
                  //   }, {} as {
                  //     [field: string]: 0 | 1
                  //   }),
                }) - 1
              }

              return acc2[index].populate as PopulateOptions[]
            }, acc)

            return acc
          }, [] as PopulateOptions[]),

        // // TODO: implement JSON:API Sparse Fieldsets (eg. fields[type]=....)
        // select: query.fields?.[type]
        //   ?.split(',')
        //   .reduce((acc, field) => {
        //     acc[field] = 1
        //     return acc
        //   }, {} as {
        //     [field: string]: 0 | 1
        //   }),

        options: {
          // Pagination limit
          limit: +(query.page?.limit ?? 10),

          // Pagination offset
          skip: +(query.page?.offset ?? 0),

          // Sorting
          sort: query.sort
            ?.split(',')
            .reduce((acc, sort) => {
              if (sort.charAt(0) === '-') {
                acc[sort.slice(1)] = -1
              } else {
                acc[sort] = 1
              }
              return acc
            }, {} as {
              [field: string]: -1 | 1
            }),
        },
      })

    } else {
      // Inclusion of Related Resources
      if (query.include) {
        this.populate(query.include
          .split(',')
          .map(includes => includes.split('.'))
          .reduce((acc, includes) => {
            includes.reduce((acc2, include) => {
              let index = acc2.findIndex(relationship => relationship.path === include)
              if (index === -1) {
                index = acc2.push({
                  path: include,
                  populate: [],
                  // // TODO: implement JSON:API Sparse Fieldsets (eg. fields[type]=....)
                  // select: query.fields?.[type]
                  //   ?.split(',')
                  //   .reduce((acc, field) => {
                  //     acc[field] = 1
                  //     return acc
                  //   }, {} as {
                  //     [field: string]: 0 | 1
                  //   }),
                }) - 1
              }

              return acc2[index].populate as PopulateOptions[]
            }, acc)

            return acc
          }, [] as PopulateOptions[]))
      }

      // Sparse Fieldsets
      if (query.fields) {
        this.select(query.fields[options.type]
          ?.split(',')
          .reduce((acc, field) => {
            acc[field] = 1
            return acc
          }, {} as {
            [field: string]: 0 | 1
          }))
      }

      // Sorting
      if (query.sort) {
        this.sort(query.sort
          .split(',')
          .reduce((acc, sort) => {
            if (sort.charAt(0) === '-') {
              acc[sort.slice(1)] = -1
            } else {
              acc[sort] = 1
            }
            return acc
          }, {} as {
            [field: string]: -1 | 1
          }))
      }


      // Pagination limit
      if (query.page?.limit) {
        this.limit(+query.page?.limit)
      } else {
        this.limit(10)
      }

      // Pagination offset
      if (query.page?.offset) {
        this.skip(+query.page?.offset)
      } else {
        this.skip(0)
      }

      // Filtering
      if (query.filter) {
        this.merge({
          $and: Object.entries(query.filter)
            .map(([field, values]) => {
              return {
                $or: values.split(',')
                  .map((value) => {
                    if (options.filter?.[field]) {
                      return options.filter[field](value)
                    } else {
                      return { [field]: value } as any
                    }
                  })
              }
            })
        })
      }
    }

    return this
  }

  schema.query.toJsonApi = function (opts) {
    // Throw an error if no document has been found
    if ((this as any).op === 'findOne' && !this.getOptions().getRelationship) {
      this.orFail(() => {
        throw new JsonApiError.ResourceNotFoundError(this.getFilter()._id)
      })
    }

    return this.transform((doc) => {
      const body: JsonApiBody<any> = {
        jsonapi: {
          version: '1.0',
        },
      }

      if (Array.isArray(doc)) {
        const { data, included } = doc
          .map((model) => model.toJsonApi(opts) as {
            data: JsonApiResource
            included: JsonApiResource[]
          })
          .reduce((acc, cur) => {
            acc.data = acc.data.concat(cur.data)
            acc.included = acc.included.concat(cur.included).filter((resource1, index, arr) => {
              return arr.findIndex((resource2) => resource1.type === resource2.type && resource1.id === resource2.id) === index
            })
            return acc
          }, {
            data: [] as JsonApiResource[],
            included: [] as JsonApiResource[],
          })

        body.data = data
        body.included = included

      } else if (doc) {
        const { data, included } = doc.toJsonApi(opts)

        body.data = data
        body.included = included

      } else {
        body.data = null
      }

      body.meta = opts.meta

      return body
    })
  }

  schema.query.paginate = function (opts) {
    return this.transform(async (body) => {
      const url = opts.url.split('?').shift() ?? '/'

      let count = 0
      if (this.getOptions().getRelationship) {
        const relationship = this.getOptions().getRelationship

        count = await this.model.findOne(this.getFilter())
          .populate({
            path: relationship,
            match: (this.mongooseOptions().populate as any)[relationship].match,
            options: {
              limit: 0,
            },
          })
          .then((doc) => {
            if (Array.isArray(doc?.get(relationship))) {
              return doc?.get(relationship).length
            } else {
              return 0
            }
          })

      } else {
        count = await this.model.countDocuments(this.getFilter())
      }

      const limit = +(opts.query.page?.limit ?? 10)
      const offset = +(opts.query.page?.offset ?? 0)

      const firstLink = `${url}?${UrlQuery.encode(Object.assign(opts.query, {
        page: {
          limit: limit,
          offset: 0,
        },
      }))}`
      const prevLink = (offset > 0) ?
        `${url}?${UrlQuery.encode(Object.assign(opts.query, {
          page: {
            limit: limit,
            offset: Math.max(offset - limit, 0),
          },
        }))}` : undefined
      const nextLink = (offset < count - limit) ?
        `${url}?${UrlQuery.encode(Object.assign(opts.query, {
          page: {
            limit: limit,
            offset: offset + limit,
          },
        }))}` : undefined
      const lastLink = `${url}?${UrlQuery.encode(Object.assign(opts.query, {
        page: {
          limit: limit,
          offset: Math.max(count - limit, 0),
        },
      }))}`

      body.links = {
        first: firstLink,
        prev: prevLink,
        next: nextLink,
        last: lastLink,
      }

      body.meta = Object.assign({}, body.meta, {
        count: count,
      })

      return body
    })
  }


  schema.methods.toJsonApi = function (opts) {
    const body: JsonApiBody<JsonApiResource> = {
      jsonapi: {
        version: '1.0',
      },
    }

    const obj: any = this.toObject()

    const type = options.type
    const id = this._id?.toString()

    if (!type) {
      throw new Error(`${this} doesn't have a JSON:API type`)
    }

    const data: JsonApiResource = {
      type: type,
      id: id,
      links: {
        self: `${opts.baseUrl}/${type}/${id}`,
      },
      attributes: {},
      relationships: {},
    }
    let included: JsonApiResource[] = []


    Object.entries({
      ...this.schema.paths,
      ...this.schema.virtuals
    } as {
      [key: string]: SchemaType | VirtualType<HydratedDocument<any>>
    })
      .map(([path, type]) => {
        const isId = (type: SchemaType | VirtualType<HydratedDocument<any>>): boolean => {
          return (type as any).path === '_id'
        }
        const isAttribute = (type: SchemaType | VirtualType<HydratedDocument<any>>): boolean => {
          return !isId(type) && !isRelationship(type)
        }
        const isRelationship = (type: SchemaType | VirtualType<HydratedDocument<any>>): boolean => {
          return !!(type as any).options?.ref || !!(type as any).options.type?.[0]?.ref ||
            !!(type as any).options?.refPath || !!(type as any).options.type?.[0]?.refPath
        }

        if (isAttribute(type)) {
          data.attributes![path] = obj[path]

        } else if (isRelationship(type)) {
          data.relationships![path] = {
            links: {
              related: `${opts.baseUrl}/${data.type}/${data.id}/${path}`,
            },
          }

          if (this.populated(path)) {
            const value = this.get(path) as JsonApiInstanceMethods | JsonApiInstanceMethods[] | null

            if (Array.isArray(value)) {
              data.relationships![path].data = value
                .map((relationship) => {
                  const { data: relationshipData, included: relationshipIncluded } = relationship.toJsonApi(opts) as {
                    data: JsonApiResource
                    included: JsonApiResource[]
                  }
                  included = included.concat(relationshipData, relationshipIncluded)

                  return {
                    type: relationshipData.type,
                    id: relationshipData.id!,
                  }
                })
            } else if (value) {
              const { data: relationshipData, included: relationshipIncluded } = value.toJsonApi(opts) as {
                data: JsonApiResource
                included: JsonApiResource[]
              }
              included = included.concat(relationshipData, relationshipIncluded)

              data.relationships![path].data = {
                type: relationshipData.type,
                id: relationshipData.id!,
              }
            } else {
              data.relationships![path].data = null
            }
          }
        }
      })

    body.data = data
    body.included = included.filter((resource1, index) => {
      return included.findIndex(resource2 => resource1.type === resource2.type && resource1.id === resource2.id) === index
    })
    body.meta = opts.meta

    return body
  }

  schema.methods.merge = function (...sources) {
    sources = sources.map((source) => {
      if (source instanceof Document) {
        return source.directModifiedPaths().reduce((acc, cur) => {
          cur.split('.').reduce((obj, path, i, arr) => {
            if (i !== arr.length - 1) {
              return obj[path] = {}
            } else {
              return obj[path] = source.get(cur)
            }
          }, acc)
          return acc
        }, {} as any)

      } else {
        return source
      }
    })

    return Object.assign(this, ...sources)
  }
}