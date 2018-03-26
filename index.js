require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const { PORT, CLIENT_ORIGIN } = require('./config')
const { dbConnect } = require('./db-mongoose')

const app = express()
const ridesRouter = require('./routers/rides.route')
const usersRouter = require('./routers/users.route')
const authRouter = require('./routers/auth.route')

const socket = require('socket.io')
//passport
const passport = require('passport')
const localStrategy = require('./passport/local')
const jwtStrategy = require('./passport/jwt')

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

//deploy passport strategy
passport.use(localStrategy)
passport.use(jwtStrategy)

//routes mounting

// app.use(express.static('public'))

app.use('/api/user', usersRouter)
app.use('/api/auth', authRouter)

app.use(passport.authenticate('jwt', { session: false, failWithError: true }))
//protected route
app.use('/api/board', ridesRouter)

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

	const io = socket(server)
	io.on('connection', socket => {
		console.log('connected to socket io', socket.id)

		//an user requests to join an room
		socket.on('JOIN_ROOM', data => {
			const { roomId, currentUser } = data
			socket.join(roomId)
			console.log('join room', roomId)
			io.sockets.in(roomId).emit('JOIN_ROOM', `${currentUser.firstName} has entered the room`)
		})

		//an user left the chat room
		socket.on('LEAVING_ROOM', data => {
			const { roomId, username } = data
			io.sockets.in(roomId).emit('LEAVING_ROOM', `${username} has left the room`)
		})

		socket.on('SEND_MESSAGE', function(data) {
			const { roomId, messageBody } = data
			console.log('sent message', messageBody)
			io.sockets.in(roomId).emit('RECEIVE_MESSAGE', messageBody)
		})

		socket.on('disconnect', function() {
			console.log('user disconnect')
		})
	})
}

if (require.main === module) {
	dbConnect()
	runServer()
}

module.exports = app
