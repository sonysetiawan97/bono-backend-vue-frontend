const http = require('http')
const Bundle = require('bono')
const bonoJson = require('bono/middlewares/json')()
const bonoNotFound = require('bono/middlewares/not-found')('404 Not Found')
const bonoLogger = require('bono/middlewares/logger')()
const cors = require('@koa/cors')

// create app
const app = new Bundle()

// middleware auth
const user = require('./src/api/user')

// api
const api = require('./src/api/api')

// app use middleware
app.use(bonoJson)
app.use(bonoLogger)
app.use(bonoNotFound)
app.use(cors())

// app create bundle
app.bundle('/api/v1', new api())
app.bundle('/api/user/v1', new user())

// serve server
const server = http.Server(app.callback());
server.listen(3000, () => {
    console.log('listening on http://localhost:3000')
})