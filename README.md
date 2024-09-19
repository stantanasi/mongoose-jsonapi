# Mongoose JSON:API

A Mongoose plugin to support [JSON:API](https://jsonapi.org) specification

[!["Buy Me A Coffee"](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/stantanasi)

### Features

- JSON:API v1.0 specification
- **Inclusion of Related Resources**
- **Sparse Fieldsets**
- **Sorting**
- **Pagination**
- **Filtering**
- **Error handling**
- Serialize Mongoose Model to JSON:API resource
- Deserialize JSON:API resource to Mongoose Model

## Installation

```bash
npm install @stantanasi/mongoose-jsonapi
```

## Usage

Add plugin to a schema

### JavaScript

```javascript
import MongooseJsonApi from '@stantanasi/mongoose-jsonapi'
import mongoose, { Schema } from 'mongoose'

const ArticleSchema = new Schema({
  title: {
    type: String,
    required: true,
  },
})

ArticleSchema.plugin(MongooseJsonApi, {
  type: 'articles',
})

const Article = mongoose.model('Article', ArticleSchema)
```

### TypeScript

```typescript
import MongooseJsonApi, { JsonApiInstanceMethods, JsonApiModel, JsonApiQueryHelper } from '@stantanasi/mongoose-jsonapi'
import mongoose, { HydratedDocument, Model, Schema, Types } from 'mongoose'

interface IArticle {
  _id: Types.ObjectId
  title: string
}

type ArticleInstanceMethods = JsonApiInstanceMethods

type ArticleQueryHelper = JsonApiQueryHelper

type ArticleModel = Model<IArticle, ArticleQueryHelper, ArticleInstanceMethods> & JsonApiModel<IArticle>

const ArticleSchema = new Schema<IArticle, ArticleModel, ArticleInstanceMethods, ArticleQueryHelper>({
  title: {
    type: String,
    required: true,
  },
})

ArticleSchema.plugin(MongooseJsonApi, {
  type: 'articles',
})


type TArticle = HydratedDocument<IArticle, ArticleInstanceMethods, ArticleQueryHelper>

const Article = mongoose.model<IArticle, ArticleModel>('Article', ArticleSchema)
```

Use methods

```typescript
const body = {
  data: {
    type: 'articles',
    id: '66e81ea7763111ccc64a104b',
    attributes: {
      title: 'JSON:API paints my bikeshed!'
    }
  }
}
const article = Article.fromJsonApi(body)
await article.save()

article._id // '66e81ea7763111ccc64a104b'
article.title // 'JSON:API paints my bikeshed!'


const response1 = article.toJsonApi({
  baseUrl: 'http://localhost:5000'
})

response1.jsonapi.version // '1.0'
response1.data.type // 'articles'
response1.data.id // '66e81ea7763111ccc64a104b'
response1.data.links.self // 'http://localhost:5000/articles/66e81ea7763111ccc64a104b'
response1.data.attributes.title // 'JSON:API paints my bikeshed!'


const response2 = await Article.findById('66e81ea7763111ccc64a104b')
  .toJsonApi({
    baseUrl: 'http://localhost:5000'
  })

response2.jsonapi.version // '1.0'
response2.data.type // 'articles'
response2.data.id // '66e81ea7763111ccc64a104b'
response2.data.links.self // 'http://localhost:5000/articles/66e81ea7763111ccc64a104b'
response2.data.attributes.title // 'JSON:API paints my bikeshed!'


const response3 = await Article.find()
  .toJsonApi({
    baseUrl: 'http://localhost:5000'
  })
  .paginate({
    url: 'http://localhost:5000/articles',
    query: {},
  })

response3.jsonapi.version // '1.0'
response3.data[0].type // 'articles'
response3.data[0].id // '66e81ea7763111ccc64a104b'
response3.data[0].links.self // 'http://localhost:5000/articles/66e81ea7763111ccc64a104b'
response3.data[0].attributes.title // 'JSON:API paints my bikeshed!'
response3.links.first // 'http://localhost:5000/articles?page[limit]=10&page[offset]=0'
```

Please refer to the [example](./example/README.md) folder to see how to use it in an Express app

## API

<!-- no toc -->
- [MongooseJsonApi()](#mongoosejsonapi)
- [Model.fromJsonApi()](#modelfromjsonapi)
- [Document.prototype.toJsonApi()](#documentprototypetojsonapi)
- [Document.prototype.merge()](#documentprototypemerge)
- [Query.prototype.getRelationship()](#queryprototypegetrelationship)
- [Query.prototype.withJsonApi()](#queryprototypewithjsonapi)
- [Query.prototype.toJsonApi()](#queryprototypetojsonapi)
- [Query.prototype.paginate()](#queryprototypepaginate)

### MongooseJsonApi()

**Parameters:**

- `type` «String» - The JSON:API resource type for the model
- `[filter]` «Object» - The JSON:API custom filtering

#### Example

```typescript
ArticleSchema.plugin(MongooseJsonApi, {
  type: 'articles',
})

// GET /articles?filter[search]=...
ArticleSchema.plugin(MongooseJsonApi, {
  type: "articles",
  filter: {
    search: (query: string) => {
      return {
        body : {
          $regex : query,
        },
      }
    },
  },
})
```

### Model.fromJsonApi()

**Parameters:**

- `body` «JsonApiBody» - The JSON:API request body

**Returns:**

- «Document» - The Mongoose Document

#### Example

```typescript
const body = {
  data: {
    type: 'articles',
    attributes: {
      title: 'JSON:API paints my bikeshed!'
    }
  }
}

const article = Article.fromJsonApi(body)
article.title // 'JSON:API paints my bikeshed!'
```

### Document.prototype.toJsonApi()

**Parameters:**

- `opts` «Object» - Options
  - `opts.baseUrl` «String» - The base URL used in JSON:API links object
  - `[opts.meta]` «Object» - The meta information to include in the JSON:API response body

**Returns:**

- «JsonApiBody» - The JSON:API response body

#### Example

```typescript
const article = new Article({
  title: 'JSON:API paints my bikeshed!'
})

const body = article.toJsonApi({
  baseUrl: 'http://localhost:5000'
})

body.data.attributes.title // 'JSON:API paints my bikeshed!'
```

### Document.prototype.merge()

**Parameters:**

- `sources` «Object | Document» - One or more source objects or documents containing the properties to be applied

**Returns:**

- «Document» - The Mongoose Document

#### Example

```typescript
const people = new People({
  firstName: 'John',
  lastName: 'Gebhardt',
})

const body = {
  data: {
    type: 'people',
    attributes: {
      lastName: 'Doe',
    }
  }
}

people.merge(People.fromJsonApi(body))

people.firstName // 'John'
people.lastName // 'Doe'
```

### Query.prototype.getRelationship()

**Parameters:**

- `relationship` «String» - The name of the relationship to retrieve

**Returns:**

- «Document | Document[]» - The related Mongoose document(s)

#### Example

```typescript
const people = new People({
  firstName: 'John',
  lastName: 'Doe',
})
await people.save()

const article = new Article({
  title: 'JSON:API paints my bikeshed!',
  author: people,
})
await article.save()

const author = await Article.findById(article._id).getRelationship('author').exec()
author.firstName // 'John'
author.lastName // 'Doe'
```

### Query.prototype.withJsonApi()

**Parameters:**

- `query` «JsonApiQueryParams» - The JSON:API Query Parameters

**Returns:**

- «Query» - The Mongoose Query

#### Example

```typescript
// ?include=author,comments&fields[articles]=title&filter[title]=JSON:API paints my bikeshed!&sort=-updatedAt&page[limit]=1
const query = {
  include: 'author,comments',
  fields: { articles: 'title' },
  filter: { title: 'JSON:API paints my bikeshed!' },
  sort: '-updatedAt',
  page: { limit: 1 }
}

const articles = await Article.find()
  .withJsonApi(query)

articles[0].title // 'JSON:API paints my bikeshed!'
```

### Query.prototype.toJsonApi()

**Parameters:**

- `opts` «Object» - Options
  - `opts.baseUrl` «String» - The base URL used in JSON:API links object
  - `[opts.meta]` «Object» - The meta information to include in the JSON:API response body

**Returns:**

- «Query» - The Mongoose Query

#### Example

```typescript
const article = new Article({
  title: 'Rails is Omakase',
})
await article.save()

const articles = await Article.find()
  .toJsonApi({
    baseUrl: 'http://localhost:5000'
  })

articles.data[0].attributes.title // 'Rails is Omakase'
```

### Query.prototype.paginate()

**Parameters:**

- `opts` «Object» - Options
  - `opts.url` «String» - The current URL without query parameters
  - `opts.query` «JsonApiQueryParams» - The current JSON:API Query Parameters

**Returns:**

- «Query» - The Mongoose Query

#### Example

```typescript
const articles = await Article.find()
  .toJsonApi({
    baseUrl: 'http://localhost:5000'
  })
  .paginate({
    url: 'http://localhost:5000/articles',
    query: {},
  })

articles.links.first // 'http://localhost:5000/articles?page[limit]=10&page[offset]=0'
```

## Contributing

Contributions are what make the open source community such an amazing place to learn, inspire, and create. Any contributions you make are **greatly appreciated**.

1. Fork the project
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a pull request

## Author

- [Lory-Stan TANASI](https://github.com/stantanasi)

## License

This project is licensed under the `Apache-2.0` License - see the [LICENSE](LICENSE) file for details

<p align="center">
  <br />
  © 2024 Lory-Stan TANASI. All rights reserved
</p>