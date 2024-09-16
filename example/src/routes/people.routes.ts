import express from 'express'
import People from '../models/people.model'

const peopleRoutes = express.Router()

peopleRoutes.get('/', async (req, res, next) => {
  try {
    const response = await People.find()
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

peopleRoutes.post('/', async (req, res, next) => {
  try {
    const id = await People.fromJsonApi(req.body)
      .save()
      .then((doc) => doc._id)

    const response = await People.findById(id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

peopleRoutes.get('/:id', async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

peopleRoutes.patch('/:id', async (req, res, next) => {
  try {
    await People.findById(req.params.id)
      .orFail()
      .then((doc) => {
        return doc
          .merge(People.fromJsonApi(req.body))
          .save()
      })

    const response = await People.findById(req.params.id)
      .withJsonApi(req.query)
      .toJsonApi({
        baseUrl: `${req.protocol}://${req.get('host')}`,
      })

    res.json(response)
  } catch (err) {
    next(err)
  }
})

peopleRoutes.delete('/:id', async (req, res, next) => {
  try {
    await People.findById(req.params.id)
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


peopleRoutes.get('/:id/articles', async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
      .getRelationship('articles')
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

peopleRoutes.get('/:id/comments', async (req, res, next) => {
  try {
    const response = await People.findById(req.params.id)
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

export default peopleRoutes
