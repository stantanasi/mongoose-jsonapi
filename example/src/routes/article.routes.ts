import express from 'express'
import Article from '../models/article.model'

const articleRoutes = express.Router()

articleRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Article.find()
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        query: req.query,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

articleRoutes.post('/', async (req, res, next) => {
  try {
    const id = await Article.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id)

    const response = await Article.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

articleRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Article.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

articleRoutes.patch('/:id', async (req, res, next) => {
  try {
    await Article.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Article.fromJsonApi(req.body))
          .save()
      })

    const response = await Article.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

articleRoutes.delete('/:id', async (req, res, next) => {
  try {
    await Article.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .deleteOne()
      })

    res.status(204).send()
  } catch (err) {
    next(err)
  }
})


articleRoutes.get('/:id/author', async (req, res, next) => {
  try {
    const response = await Article.findById(req.params.id)
      .getRelationship('author')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

articleRoutes.get('/:id/comments', async (req, res, next) => {
  try {
    const response = await Article.findById(req.params.id)
      .getRelationship('comments')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })
      .paginate({
        url: `${req.protocol}://${req.get('host')}${req.originalUrl}`,
        query: req.query,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

export default articleRoutes
