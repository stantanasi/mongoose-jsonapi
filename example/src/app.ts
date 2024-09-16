import { JsonApiError, JsonApiErrors } from '@stantanasi/mongoose-jsonapi'
import cors from 'cors'
import dotenv from 'dotenv'
import express, { NextFunction, Request, Response } from 'express'
import { connect } from 'mongoose'
import articleRoutes from './routes/article.routes'
import commentRoutes from './routes/comment.routes'
import peopleRoutes from './routes/people.routes'

dotenv.config()

const app = express()

app.use(cors())
app.use(express.json({ limit: '50mb' }))
app.use((_req, res, next) => {
  res.header('Content-Type', 'application/vnd.api+json')
  next()
})

app.use(async (_req, _res, next) => {
  try {
    await connect(process.env.MONGO_DB_URI || 'mongodb://localhost/mongoose-jsonapi-example')
    next()
  } catch (err) {
    next(err)
  }
})

app.use('/articles', articleRoutes)
app.use('/comments', commentRoutes)
app.use('/peoples', peopleRoutes)

app.all('*', (req, _res) => {
  throw new JsonApiError.RouteNotFoundError(req.path)
})

// Error handling
app.use((err: Error, _req: Request, res: Response, _next: NextFunction) => {
  console.error(err)
  if (err instanceof JsonApiErrors) {
    res.status(err.status).json(err)
  } else if (err instanceof JsonApiError) {
    const errors = new JsonApiErrors([err])
    res.status(errors.status).json(errors)
  } else {
    const errors = JsonApiErrors.from(err)
    res.status(errors.status).json(errors)
  }
})

const port = +(process.env.PORT || 5000)
app.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
