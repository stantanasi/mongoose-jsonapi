import { Error as MongooseError } from 'mongoose'
import { IJsonApiError, JsonApiBody } from '../types/jsonapi.types'

export class JsonApiErrors extends Error {

  errors: JsonApiError[]

  get status(): number {
    return +(this.errors
      .find((error) => error.status !== undefined)
      ?.status
      ?? 500)
  }

  constructor(errors: JsonApiError[]) {
    super()
    this.errors = errors
  }

  static from(err: Error): JsonApiErrors {
    if (err instanceof MongooseError.ValidationError) {
      return new JsonApiErrors(
        Object.values(err.errors).map((err) => {
          return JsonApiError.from(err)
        })
      )
    } else {
      return new JsonApiErrors([
        JsonApiError.from(err),
      ])
    }
  }

  toJSON(): JsonApiBody {
    const body: JsonApiBody = {
      errors: this.errors.map((error) => error.toJSON()),
    }

    return body
  }
}

export class JsonApiError extends Error implements IJsonApiError {

  id?: string
  links?: {
    about?: string
  }
  status?: string
  code?: string
  title?: string
  detail?: string
  source?: {
    pointer?: string
    parameter?: string
  }
  meta?: any

  constructor(obj: IJsonApiError) {
    super()
    Object.assign(this, obj)
  }

  static from(err: Error): JsonApiError {
    if (err instanceof MongooseError.DocumentNotFoundError) {
      return new JsonApiError({
        status: '404',
        title: 'Resource not Found',
        detail: err.message,
        meta: {
          stack: err.stack,
        },
      })
    } else if (err instanceof MongooseError.ValidatorError) {
      return new JsonApiError.InvalidAttribute(
        err.path,
        err.message,
      )
    } else {
      return new JsonApiError({
        status: '500',
        title: err.name,
        detail: err.message,
        meta: {
          stack: err.stack,
        },
      })
    }
  }

  toJSON(): IJsonApiError {
    return {
      id: this.id,
      links: this.links,
      status: this.status,
      code: this.code,
      title: this.title,
      detail: this.detail,
      source: this.source,
      meta: this.meta,
    }
  }


  static PermissionDenied = class extends JsonApiError {
    constructor() {
      super({
        status: '403',
        title: 'Permission denied',
      })
    }
  }

  static RouteNotFoundError = class extends JsonApiError {
    constructor(path: string) {
      super({
        status: '404',
        title: 'Route not found',
        detail: `The path '${path}' does not exist.`,
      })
    }
  }

  static ResourceNotFoundError = class extends JsonApiError {
    constructor(id: any) {
      super({
        status: '404',
        title: 'Resource not Found',
        detail: `The resource identified by ${id} could not be found`,
      })
    }
  }

  static MissingAttribute = class extends JsonApiError {
    constructor(attribute: string) {
      super({
        status: '400',
        title: 'Missing attribute',
        detail: `Missing required attribute: ${attribute}`,
      })
    }
  }

  static InvalidAttribute = class extends JsonApiError {
    constructor(attribute: string, message: string) {
      super({
        status: '400',
        title: 'Invalid attribute',
        detail: message,
        source: {
          pointer: `/data/attributes/${attribute}`
        },
      })
    }
  }
}