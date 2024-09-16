import cors from 'cors'
import dotenv from 'dotenv'
import express from 'express'
import { connect } from 'mongoose'

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

const port = +(process.env.PORT || 5000)
app.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
