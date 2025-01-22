import express, { json } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { createServer } from 'http';
import socketIo from 'socket.io';

config();

const app = express();

app.use(cors()); 
app.use(json());

const server = createServer(app);
const io = socketIo(server); 

app.get('/', (req, res) => {
  res.send('Hello, welcome to the messaging system backend!');
});

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
