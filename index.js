const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const { PORT, CLIENT_ORIGIN } = require('./config')
const { dbConnect } = require('./db-mongoose')
// const {dbConnect} = require('./db-knex');

const app = express()
const cheesesRouter = require('./routers/cheeses.route')
//morgan logger middleware
app.use(
	morgan(process.env.NODE_ENV === 'production' ? 'common' : 'dev', {
		skip: (req, res) => process.env.NODE_ENV === 'test'
	})
)
// cors middleware
app.use(
	cors({
		origin: CLIENT_ORIGIN
	})
)
// body parser middleware
app.use(express.json())

//routes mounting
app.use('/api', cheesesRouter)

// Catch-all 404
app.use(function(req, res, next) {
	const err = new Error('Not Found')
	err.status = 404
	next(err)
})

// Catch-all Error handler
// Add NODE_ENV check to prevent stacktrace leak
app.use(function(err, req, res, next) {
	res.status(err.status || 500)
	res.json({
		message: err.message,
		error: app.get('env') === 'development' ? err : {}
	})
})

function runServer(port = PORT) {
	const server = app
		.listen(port, () => {
			console.info(`App listening on port ${server.address().port}`)
		})
		.on('error', err => {
			console.error('Express failed to start')
			console.error(err)
		})
}

if (require.main === module) {
	dbConnect()
	runServer()
}

module.exports = { app }
