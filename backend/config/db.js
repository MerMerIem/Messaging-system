// here we will setup the database connection

import mysql from 'mysql2';
import {config} from 'dotenv';

config();

// create multiple connections to the database
const db = mysql.createPool({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    port: process.env.DB_PORt || '3306',
    password: process.env.DB_PASSWORD || 'rani',
    database: process.env.DB_NAME || 'messaging_system'
});

// function to verify database connection
db.getConnection((err, connection) => {
  if (err) {
    console.error('Error connecting to the MySQL database:', err.message);
    return;
  }
  console.log('Connected to the MySQL database successfully!');
  connection.release();
});

export default db.promise();