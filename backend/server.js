import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { createServer } from 'http';
import {config} from 'dotenv';
config();
import { Server } from 'socket.io';
import router from './routes/authenticationRoute.js';

const app = express();

app.use(cors());
app.use(json());
app.use('/',router);

const server = createServer(app);
const io = new Server(server);

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});