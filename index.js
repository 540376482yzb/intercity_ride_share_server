require('dotenv').config()
const express = require('express')
const cors = require('cors')
const morgan = require('morgan')

const {PORT, CLIENT_ORIGIN} = require('./config')
const {dbConnect} = require('./db-mongoose')

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

app.use(passport.authenticate('jwt', {session: false, failWithError: true}))
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
	const Rides = require('./models/rides')
	const Users = require('./models/users')

	let rooms = {}
	let mapUserToRoom = {}
	io.on('connection', socket => {
		console.log('connected to socket io', socket.id)
		//an user requests to join an room

		socket.on('JOIN_ROOM', data => {
			const {roomId, user} = data
			socket.join(roomId)
			const id = socket.id
			mapUserToRoom[id] = {user, roomId}
			if (!rooms.roomId) {
				rooms.roomId = [{socket: socket.id, user: user.id}]
			} else {
				rooms.roomId.push({socket: socket.id, user: user.id})
			}
			io.sockets.in(roomId).emit('JOIN_ROOM', {user, room: rooms.roomId})
		})
		//an user left the chat room
		socket.on('LEAVING_ROOM', data => {
			console.log('leaving')
			rooms.roomId = rooms.roomId.filter(entry => entry.user === data.user.id)
			io.sockets.in(data.roomId).emit('LEAVING_ROOM', data.user)
		})
		socket.on('SEND_MESSAGE', function(data) {
			const {roomId, message} = data
			Rides.findByIdAndUpdate(roomId, {$push: {messages: message}}, {new: true}).then(ride =>
				io.sockets.in(roomId).emit('RECEIVE_MESSAGE', ride.messages)
			)
		})
		socket.on('REQUEST_RIDE', ({roomId, message}) => {
			Rides.findByIdAndUpdate(roomId, {$push: {messages: message}}, {new: true})
				.then(() =>
					Users.findByIdAndUpdate(message.user.id, {$push: {sentRequests: roomId}}, {new: true})
				)
				.then(() => io.sockets.in(roomId).emit('RECEIVE_RIDE', message))
		})

		socket.on('ACCEPT_RIDE', ({ride, userId}) => {
			const messages = ride.messages.map(message => {
				if (message.type === 'application') {
					if (message.user.id === userId) {
						message.completed = 'accepted'
					}
				}
				return message
			})
			let lock = false
			if (ride.match.length === ride.maxOccupancy - 1) {
				lock = true
			}
			Rides.findByIdAndUpdate(
				ride.id,
				{$push: {match: userId}, messages, $set: {lock}},
				{new: true}
			).then(_ride => {
				io.sockets.in(ride.id).emit('ACCEPT_RIDE_SUCCESS', ride.id)
				return Users.findByIdAndUpdate(userId, {sentRequests: [], match: ride.id})
			})
		})
		socket.on('disconnect', function() {
			const userId = socket.id
			const foundUser = mapUserToRoom[userId]
			if (foundUser) {
				const roomId = foundUser.roomId
				const user = foundUser.user
				rooms.roomId = rooms.roomId.filter(entry => entry.socket !== userId)
				io.sockets.in(roomId).emit('LEAVING_ROOM', {user, room: rooms.roomId})
			}
		})
	})
}

if (require.main === module) {
	dbConnect()
	runServer()
}

module.exports = app
