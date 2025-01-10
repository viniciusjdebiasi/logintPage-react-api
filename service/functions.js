const pool = require('./connection');
const bcrypt = require('bcrypt');
const sendEmail = require('./emailnode');

// select
async function SelectUser(param) {
    const connectionBD = await pool.pool.getConnection();
    const responseBD = await connectionBD.query('SELECT id, name, date, email, phone, image FROM users WHERE id = ?', [param]);
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
    const insertMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramE,
        subject: "Creazione dell'account - Pagina di Acesso",
        html: `
            <h1>Ciao ${paramN}!</h1>
            <p style="font-size: 22px;">
                Stai ricevendo un'e-mail perché il tuo account nella <br>
                <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: green;">Pagina di Accesso</a> è stato creato correttamente!
                <h2 style="font-size: 25px;">Grazie!</h2>
            </p>
            <img src="https://img.freepik.com/fotos-premium/personagem-de-desenho-animado-de-banana-feliz-mostrando-polegares-para-cima-gerado-por-ia_941600-4334.jpg" style="width: 300px; height: auto;" alt="Felicità">
        `
    };
    if (paramFN) {
        const insertUser = await connectionBD.query('INSERT INTO users (name, date, email, phone, password, image, time) VALUES (?, ?, ?, ?, ?, ?, ?)', [paramN, paramUD, paramE, paramP, hashedPassword, paramFN, paramTI]);
        connectionBD.release();
        await sendEmail.sendEmail(insertMailOptions);
        return { status: true, message: insertUser, cod: 200 };
    } else {
        const insertUser = await connectionBD.query('INSERT INTO users (name, date, email, phone, password, image, time) VALUES (?, ?, ?, ?, ?, ?, ?)', [paramN, paramUD, paramE, paramP, hashedPassword, '', paramTI]);
        connectionBD.release();
        await sendEmail.sendEmail(insertMailOptions);
        return { status: true, message: insertUser, cod: 200 };
    }
};

// delete
async function DeleteUser(paramID, paramE, paramN) {
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('DELETE FROM users WHERE id = ?', [paramID])
    connectionBD.release();
    const deleteMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramE,
        subject: "Eliminazione dell'account - Pagina di Acesso",
        html: `
            <h1>Ciao ${paramN}!</h1>
            <p style="font-size: 22px;">
                Stai ricevendo un'e-mail perché il tuo account nella <br>
                <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: green;">Pagina di Accesso</a> è stata esclusa correttamente!
                <h2 style="font-size: 25px;">Arrivederci!</h2>
            </p>
            <img src="https://s2.glbimg.com/kOfT4B8Pi8kmS-I9_PwwFuT8tq4=/smart/e.glbimg.com/og/ed/f/original/2015/05/15/minions-filme.jpg" style="width: 300px; height: auto;" alt="Tristezza">
        `
    };
    await sendEmail.sendEmail(deleteMailOptions);
    return { status: true, message: 'Success', cod: 200 };
};

// update


exports.SelectUser = SelectUser;
exports.InsertUser = InsertUser;
exports.DeleteUser = DeleteUser;