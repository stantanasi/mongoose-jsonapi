import express from 'express'

const app = express()

app.use(express.json({ limit: '50mb' }))
app.use((_req, res, next) => {
  res.header('Content-Type', 'application/vnd.api+json')
  next()
})

const port = +(process.env.PORT || 5000)
app.listen(port, () => {
  console.log(`Server is listening on ${port}`)
})
