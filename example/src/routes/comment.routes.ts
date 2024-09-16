import express from 'express'
import Comment from '../models/comment.model'

const commentRoutes = express.Router()

commentRoutes.get('/', async (req, res, next) => {
  try {
    const response = await Comment.find()
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

commentRoutes.post('/', async (req, res, next) => {
  try {
    const id = await Comment.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id)

    const response = await Comment.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

commentRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await Comment.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

commentRoutes.patch('/:id', async (req, res, next) => {
  try {
    await Comment.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(Comment.fromJsonApi(req.body))
          .save()
      })

    const response = await Comment.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

commentRoutes.delete('/:id', async (req, res, next) => {
  try {
    await Comment.findById(req.params.id)
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


commentRoutes.get('/:id/article', async (req, res, next) => {
  try {
    const response = await Comment.findById(req.params.id)
      .getRelationship('article')
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

commentRoutes.get('/:id/author', async (req, res, next) => {
  try {
    const response = await Comment.findById(req.params.id)
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

export default commentRoutes
