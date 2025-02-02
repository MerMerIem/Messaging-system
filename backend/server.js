import express, { json, urlencoded } from 'express';
import cors from 'cors';
// import { config } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import router from './routes/authenticationRoute.js';
// import mysql from 'mysql2/promise';

// config();

const app = express();
 
app.use(cors());
app.use(json());
app.use('/',router);

const server = createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});



const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
