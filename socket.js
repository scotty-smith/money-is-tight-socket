const http = require('http')
const express = require('express')
const PORT = process.env.PORT || 8000
const app = express()

var server = http.createServer(app);

server.listen(PORT, () => console.log(`Listening on ${PORT}`));

const io = require('socket.io')(server,{
	cors : {
		origin : '*',
		methods : ['GET', 'POST']
	}
})

let users = []

const addUser = (userId, socketId, userInfo) => {

	const checkUser = users.some(u=>u.userId === userId)
	if(!checkUser) {
		users.push({userId, socketId, userInfo})
	}	
}

const userRemove = (socketId) => {
	users = users.filter(u=>u.socketId !== socketId)
}

const findFriend = (id) => {
	return users.find(u=>u.userId === id)
}

io.on('connection', (socket) => {
	console.log('user is pussy..........')
	socket.on('addUser', (userId,userInfo) => {
		addUser(userId, socket.id, userInfo)
		io.emit('getUser', users)
	})
	socket.on('joinGroupChat', () => {
		socket.join('money-is-tight')
		console.log('in gc')
	})
	socket.on('sendMessage', (data) => {
		const user = findFriend(data.receiverId)
		console.log(user, data)
		if(user !== undefined){
			socket.to(user.socketId).emit('getMessage', {
				senderId : data.senderId,
				senderName : data.senderName,
				receiverId : data.receiverId,
				createAt : data.time,
				message : data.message
			})
		}
	})
	socket.on('sendGroupMessage', (data) => {
		socket.to('money-is-tight').emit('getGroupMessage', {
			senderId : data.senderId,
			receiverId : 'money-is-tight',
			senderName : data.senderName,
			createAt : data.time,
			message : data.message
		})
	})
	socket.on('disconnect', () => {
		console.log('user disconnect')
		userRemove(socket.id)
		io.emit('getUser', users)
	})
})

