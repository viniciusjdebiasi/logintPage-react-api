const mysql = require('mysql2/promise');

const pool = mysql.createPool({
    host: 'localhost',
    user: 'usuario',
    password: '1',
    database: 'loginpage'
});

exports.pool = pool;