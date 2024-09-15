import { Error as MongooseError } from 'mongoose';
import { IJsonApiError, JsonApiBody } from "../types/jsonapi.types";

export class JsonApiError extends Error implements IJsonApiError {

  id?: string;
  links?: {
    about?: string;
  };
  status?: string;
  code?: string;
  title?: string;
  detail?: string;
  source?: {
    pointer?: string;
    parameter?: string;
  };
  meta?: any;

  constructor(obj: IJsonApiError) {
    super();
    Object.assign(this, obj);
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
      });
    } else {
      return new JsonApiError({
        status: '500',
        title: err.name,
        detail: err.message,
        meta: {
          stack: err.stack,
        },
      });
    }
  }

  toJSON(): JsonApiBody {
    const body: JsonApiBody = {
      errors: [],
    };

    body.errors?.push({
      id: this.id,
      links: this.links,
      status: this.status,
      code: this.code,
      title: this.title,
      detail: this.detail,
      source: this.source,
      meta: this.meta,
    });

    return body;
  }


  static PermissionDenied = class extends JsonApiError {
    constructor() {
      super({
        status: '403',
        title: 'Permission denied',
      });
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
}