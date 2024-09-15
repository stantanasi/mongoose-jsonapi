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

  constructor(public obj: IJsonApiError) {
    super();
    Object.assign(this, obj);
  }

  static from(err: Error): JsonApiError {
    return new JsonApiError({
      status: '500',
      title: err.name,
      detail: err.message,
      meta: err.stack,
    });
  }

  toJSON(): JsonApiBody {
    return {
      errors: [
        this.obj,
      ],
    };
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
}