const pool = require('./connection');
const service = require('./services');

// select USER por id
async function SelectUser(paramId) {
    const connectionBD = await pool.pool.getConnection();
    const responseBD = await connectionBD.query('SELECT id, name, date, email, phone, image FROM users WHERE id = ?', [paramId]);
    const responseF = responseBD[0]
    connectionBD.release();
    return { status: true, message: responseF, cod: 200 };
};

// select por email
async function SelectUserEmail(paramEmail) {
    const connectionBD = await pool.pool.getConnection();
    const responseBD = await connectionBD.query('SELECT u.id AS iduser, prc.id AS idcode, prc.userid, prc.code, u.name, u.date, u.email, u.phone, prc.verified FROM passwordrecoverycode AS prc RIGHT JOIN users AS u ON u.id = prc.userid WHERE u.email = ?', [paramEmail]);
    const responseF = responseBD[0];
    connectionBD.release();
    return { status: true, message: responseF, cod: 200 };
};

// insert USER
async function InsertUser(paramName, paramDay, paramMonth, paramYear, paramEmail, paramPhone, paramPassword, paramFileName) {
    const hashedPassword = await service.CreateHash(paramPassword);
    const paramTimeInsert = await service.CreateDate();
    const paramUserDate = `${paramYear}${paramMonth}${paramDay}`;
    const insertMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramEmail,
        subject: "Creazione dell'account - Pagina di Acesso",
        html: `
            <h1>Ciao ${paramName}!</h1>
            <p style="font-size: 22px;">
                Stai ricevendo un'e-mail perché il tuo account nella <br>
                <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: green;">Pagina di Accesso</a> è stato creato correttamente!
                <h2 style="font-size: 25px;">Grazie!</h2>
            </p>
            <img src="https://img.freepik.com/fotos-premium/personagem-de-desenho-animado-de-banana-feliz-mostrando-polegares-para-cima-gerado-por-ia_941600-4334.jpg" style="width: 300px; height: auto;" alt="Felicità">
        `
    };

    const connectionBD = await pool.pool.getConnection();

    if (paramFileName) {
        await connectionBD.query('INSERT INTO users (name, date, email, phone, password, image, time) VALUES (?, ?, ?, ?, ?, ?, ?)', [paramName, paramUserDate, paramEmail, paramPhone, hashedPassword, paramFileName, paramTimeInsert]);
        connectionBD.release();
        await service.sendEmail(insertMailOptions);
        return { status: true, message: 'Success', cod: 200 };
    } else {
        await connectionBD.query('INSERT INTO users (name, date, email, phone, password, image, time) VALUES (?, ?, ?, ?, ?, ?, ?)', [paramName, paramUserDate, paramEmail, paramPhone, hashedPassword, '', paramTimeInsert]);
        connectionBD.release();
        await service.sendEmail(insertMailOptions);
        return { status: true, message: 'Success', cod: 200 };
    }
};

// insert CODE
async function InsertCode(paramUserId, paramEmail) {
    const paramVerified = 0;
    const code = await service.CreateCode();
    const userCode = code.userCode;
    const hashCode = code.hash;
    const insertMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramEmail,
        subject: "Codice per cambiare password",
        html: `
            <h1>Ciao!</h1>
            <p style="font-size: 22px;">
                Questo è il codice per cambiare la password: <h2>${userCode}</h2>
            </p>
        `
    };
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('INSERT INTO passwordrecoverycode (userid, code, verified) VALUES (?, ?, ?)', [paramUserId, hashCode, paramVerified]);
    await service.sendEmail(insertMailOptions);
    return { status: true, message: 'Success', cod: 200 };
};

// delete user
async function DeleteUser(paramIdUser, paramEmail, paramName) {
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('DELETE FROM users WHERE id = ?', [paramIdUser])
    connectionBD.release();
    const deleteMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramEmail,
        subject: "Eliminazione dell'account - Pagina di Acesso",
        html: `
            <h1>Ciao ${paramName}!</h1>
            <p style="font-size: 22px;">
                Stai ricevendo un'e-mail perché il tuo account nella <br>
                <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: green;">Pagina di Accesso</a> è stata esclusa correttamente!
                <h2 style="font-size: 25px;">Arrivederci!</h2>
            </p>
            <img src="https://s2.glbimg.com/kOfT4B8Pi8kmS-I9_PwwFuT8tq4=/smart/e.glbimg.com/og/ed/f/original/2015/05/15/minions-filme.jpg" style="width: 300px; height: auto;" alt="Tristezza">
        `
    };
    await service.sendEmail(deleteMailOptions);
    return { status: true, message: 'Success', cod: 200 };
};

// delete 
async function DeleteCode(paramIdCode) {
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('DELETE FROM passwordrecoverycode WHERE id = ?', [paramIdCode])
    connectionBD.release();
    return { status: true, message: 'Success', cod: 200 };
}

// update code verificar
async function ChangeVerifyed(paramCodeUser) {
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('UPDATE passwordrecoverycode SET verified = 1 WHERE id = ?', [paramCodeUser])
    connectionBD.release();
    return { status: true, message: 'Success', cod: 200 };
};

// update new password
async function ChangePassword(paramNewPassword, paramUserCode, paramIdCode, paramEmail) {
    const newpasswordHash = await service.CreateHash(paramNewPassword);
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('UPDATE users SET password = ? WHERE id = ?', [newpasswordHash, paramUserCode]);
    await DeleteCode(paramIdCode);
    connectionBD.release();
    const insertMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramEmail,
        subject: "Modifica password - Pagina di Acesso",
        html: `
            <h1>Ciao!</h1>
            <p style="font-size: 22px;">
                Stai ricevendo un'e-mail perché il tuo password sulla <br>
                <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: green;">Pagina di Accesso</a> è stato modificato correttamente!
                <h2 style="font-size: 25px;">Grazie!</h2>
            </p>
        `
    };
    await service.sendEmail(insertMailOptions);
    return { status: true, message: 'Success', cod: 200 };
};

exports.SelectUser = SelectUser;
exports.InsertUser = InsertUser;
exports.DeleteUser = DeleteUser;
exports.InsertCode = InsertCode;
exports.SelectUserEmail = SelectUserEmail;
exports.ChangeVerifyed = ChangeVerifyed;
exports.ChangePassword = ChangePassword;
exports.DeleteCode = DeleteCode;