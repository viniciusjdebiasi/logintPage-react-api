const mysql = require('mysql2/promise');
const dotenv = require('dotenv');
dotenv.config();

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME
});

pool.getConnection()
    .then(connection => {
        const date = new Date();
        console.log(`DATABASE CONNECTED SUCCESSFULLY | ${date}`);
        connection.release();
    })
    .catch(err => {
        console.log(`ERROR CONNECTING TO MySQL: ${err}`);
    });

exports.pool = pool;