const http = require('http')
const path = require('path')
const express = require('express');
const socketio = require('socket.io');

const moongose = require('mongoose');

const app = express();
const server = http.createServer(app);
const io = socketio(server);

// DB Connections
moongose.connect('mongodb://localhost/chat-database')
    .then(db => console.log('db is connected'))
    .catch(err => console.log(err))

// Settings
app.set('port', process.env.PORT || 2022)

require('./sockets')(io);

// Static Files
app.use(express.static(path.join(__dirname,'public')));

// Starting The Server
server.listen(app.get('port'), () =>{
    console.log('server on port' , app.get('port'))
});