import express, { json, urlencoded } from 'express';
import cors from 'cors';
import { config } from 'dotenv';
import { createServer } from 'http';
import { Server } from 'socket.io';
import mysql from 'mysql2/promise';
import authentication from './users/authentication.js';

config();

const app = express();

app.use(cors());
app.use(json());
app.use('/',authentication);

const server = createServer(app);
const io = new Server(server);

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || '3306',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || 'rani',
  database: process.env.DB_NAME || 'messaging_system'
};

const pool = mysql.createPool(dbConfig);

(async () => {
  try {
    const connection = await pool.getConnection();
    console.log('Connected to the MySQL database successfully!');
    connection.release();
  } catch (error) {
    console.error('Error connecting to the MySQL database:', error.message);
  }
})();

app.get('/', (req, res) => {
  res.send('Hello, welcome to the messaging system backend!');
});

// Test database query route
app.get('/todos', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM todos');
    res.json(rows);
  } catch (error) {
    console.error('Error fetching todos:', error.message);
    res.status(500).send('Error fetching todos from the database');
  }
});

io.on('connection', (socket) => {
  console.log('A user connected');
  
  socket.on('disconnect', () => {
    console.log('A user disconnected');
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
