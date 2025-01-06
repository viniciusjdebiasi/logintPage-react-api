const pool = require('./connection');
const bcrypt = require('bcrypt');

// select
async function SelectUser(param) {
    const connectionBD = await pool.pool.getConnection();
    const responseBD = await connectionBD.query('SELECT name, date, email, phone, password, image FROM users WHERE id = ?', [param]);
    const responseF = responseBD[0]
    connectionBD.release();
    return { status: true, message: responseF, cod: 200 };
};

// insert
async function InsertUser(paramN, paramD, paramM, paramY, paramE, paramP, paramPW, paramFN) {
    const saltRounds = 10;
    let date = new Date();
    let paramTI = `${date.getHours()}:${date.getMinutes()} ${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    let paramUD = `${paramY}${paramM}${paramD}`;
    const hashedPassword = await bcrypt.hash(paramPW, saltRounds);
    const connectionBD = await pool.pool.getConnection();
    if (paramFN) {
        const insertUser = await connectionBD.query('INSERT INTO users (name, date, email, phone, password, image, time) VALUES (?, ?, ?, ?, ?, ?, ?)', [paramN, paramUD, paramE, paramP, hashedPassword, paramFN, paramTI]);
        connectionBD.release();
        return { status: true, message: insertUser, cod: 200 };
    } else {
        const insertUser = await connectionBD.query('INSERT INTO users (name, date, email, phone, password, image, time) VALUES (?, ?, ?, ?, ?, ?, ?)', [paramN, paramUD, paramE, paramP, hashedPassword, '', paramTI]);
        connectionBD.release();
        return { status: true, message: insertUser, cod: 200 };
    }
};

// delete
async function DeleteUser(param) {
    const connectionBD = await pool.pool.getConnection();
    const deleteUser = connectionBD.query('DELETE FROM users WHERE id = ?', [param])
    connectionBD.release();
    return { status: true, message: deleteUser, cod: 200 };
};

// update

exports.SelectUser = SelectUser;
exports.InsertUser = InsertUser;
exports.DeleteUser = DeleteUser;