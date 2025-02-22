import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import {config} from 'dotenv';
config();
import { Server } from 'socket.io';
import authRouter from './routes/authenticationRoute.js';
import sendFileRouter from './routes/sendingFilesRoute.js';
import downloadFileRouter from './routes/downloadFileRoute.js';

const app = express();


//test test 
app.use(cors());
app.use(json());
app.use('/uploads', express.static('uploads'));
app.use('/api/auth',authRouter);
app.use('/api/sendFile',sendFileRouter);
app.use('/api/downloadFile',downloadFileRouter);

const meriem = "";
const meriem3 = "";

const server = createServer(app);
const io = new Server(server , {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
    allowedHeaders: ["Authorization"]
  },
  transports: ["websocket", "polling"],
});

var users = [];

io.on('connection', (socket) => {
  console.log('A user connected');

  // store the new connected user in the array
  const id = socket.handshake.query.userId;
  const name = socket.handshake.query.userName;
  const socketId = socket.id;
  var newUser = {id , name , socketId};
  // console.log(newUser);

  users.push(newUser);
  console.log('connected users :',users);

  // send the list of online users to the frontend
  io.emit('users:online',users, ()=> console.log("emitted 1 !"));

  // emit a message to everyone 
  socket.emit('welcome', `Welcome ${name} to our application !`);

  // recieve the message sent by the sender client
  socket.on('private:message', (message)=>{
    console.log('Recieved message :');
    console.log('from :',message.from);
    console.log('to :',message.to);
    console.log('content :',message.content);
    console.log('at :',message.timestamp);

    // find the right user to send him the message
    const recieverUser = users.find(user => user.id === message.to);
    console.log(recieverUser);
    io.to(recieverUser.socketId).emit('private:message', message);
  });

  socket.on('private:file',(file) =>{
    console.log('recieved file',file);
    // find the right user to send him the file
    const recieverUser = users.find(user => user.id === file.to);
    console.log(recieverUser);
    io.to(recieverUser.socketId).emit('private:file',file);
  });

  // inform all user that a new user has connected except for the user himself
  socket.broadcast.emit('welcome', `${name} has connected !`);

  // inform all user that a user has left except for the user himself
  socket.on('disconnect', () => {
    console.log('A user disconnected');
    io.emit('welcome', `${name} has left`);
    users = users.filter(user => user.socketId !== socket.id);
    // send the list of online users to the frontend
    io.emit('users:online',users, ()=> console.log('connected users :',users));
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});