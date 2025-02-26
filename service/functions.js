const pool = require('./connection');
const service = require('./services');

async function SelectUser(paramId) {
    const connectionBD = await pool.pool.getConnection();
    const responseBD = await connectionBD.query('SELECT id, name, date, email, phone, image FROM users WHERE id = ?', [paramId]);
    const responseF = responseBD[0]
    connectionBD.release();
    return { status: true, message: responseF, cod: 200 };
};

async function SelectUserEmail(paramEmail) {
    const connectionBD = await pool.pool.getConnection();
    const responseBD = await connectionBD.query('SELECT u.id AS iduser, u.id As id, prc.id AS idcode, prc.userid, prc.code, u.name, u.date, u.email, u.phone, prc.verified, u.image FROM passwordrecoverycode AS prc RIGHT JOIN users AS u ON u.id = prc.userid WHERE u.email = ?', [paramEmail]);
    const responseF = responseBD[0];
    connectionBD.release();
    return { status: true, message: responseF, cod: 200 };
};

async function InsertUser(paramName, paramDay, paramMonth, paramYear, paramEmail, paramPhone, paramPassword, paramFileName) {
    const hashedPassword = await service.CreateHash(paramPassword);
    const paramTimeInsert = await service.CreateDate();
    const paramUserDate = `${paramYear}${paramMonth}${paramDay}`;
    const insertMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramEmail,
        subject: "Creazione dell'account - Pagina di Acesso",
        html: 
`
    <div style="text-align: center;">
      <div style="background-color: #9400D3; width: 100%; max-width: 460px; height: 30px; "></div>

      <div style="font-size: 22px; text-align: justify; max-width: 450px; padding: 2px; ">
        <h2 style="text-align: left; ">Ciao ${paramName}!</h2>
        <p>
          Stai ricevendo un'e-mail perché il tuo account nella
          <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: #9400D3; ">Pagina di Accesso</a> è stato creato correttamente!
          <h2 style="font-size: 25px; ">Grazie!</h2>
        </p>
      </div>

      <div style="width: 100%; text-align: center; max-width: 460px; ">
        <img src="https://img.freepik.com/fotos-premium/personagem-de-desenho-animado-de-banana-feliz-mostrando-polegares-para-cima-gerado-por-ia_941600-4334.jpg" style="width: 350px; height: auto;" alt="Felicità">
      </div>
      
      <div style="background-color: #9400D3; width: 460px; height: 30px; margin-top: 20px; "></div>
    </div>
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

async function InsertCode(paramUserId, paramEmail) {
    const paramVerified = 0;
    const code = await service.CreateCode();
    const userCode = code.userCode;
    const hashCode = code.hash;
    const insertMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramEmail,
        subject: "Codice per cambiare password",
        html: 
`
<div style="text-align: center; max-width: 460px;" >
      <div style="background-color: #9400D3; width: 100%; max-width: 460px; height: 30px; "></div>

      <div style="font-size: 22px; text-align: justify; max-width: 450px; padding: 2px; ">
        <h2 style="text-align: left; ">Ciao!</h2>
        <p>
          Questo è il codice per cambiare la password: 
        </p>
      </div>

      <h2 style="letter-spacing: 1rem; color: #9400D3; font-size: 25px; ">${userCode}</h2>
      
      <div style="background-color: #9400D3; width: 460px; height: 30px; margin-top: 20px; "></div>
    </div>
`
    };
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('INSERT INTO passwordrecoverycode (userid, code, verified) VALUES (?, ?, ?)', [paramUserId, hashCode, paramVerified]);
    await service.sendEmail(insertMailOptions);
    return { status: true, message: 'Success', cod: 200 };
};

async function DeleteUser(paramIdUser, paramEmail, paramName) {
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('DELETE FROM users WHERE id = ?', [paramIdUser])
    connectionBD.release();
    const deleteMailOptions = {
        from: 'debiasivj@gmail.com',
        to: paramEmail,
        subject: "Eliminazione dell'account - Pagina di Acesso",
        html: 
`
    <div style="text-align: center;">
      <div style="background-color: #9400D3; width: 100%; max-width: 460px; height: 30px; "></div>

      <div style="font-size: 22px; text-align: justify; max-width: 450px; padding: 2px; ">
        <h2 style="text-align: left; ">Ciao ${paramName}!</h2>
        <p style="font-size: 22px;">
                Stai ricevendo un'e-mail perché il tuo account nella <br>
                <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: #9400D3;">Pagina di Accesso</a> è stata esclusa correttamente!
                <h2 style="font-size: 25px;">Arrivederci!</h2>
            </p>
      </div>

      <div style="width: 100%; text-align: center; max-width: 460px; ">
        <img src="https://s2.glbimg.com/kOfT4B8Pi8kmS-I9_PwwFuT8tq4=/smart/e.glbimg.com/og/ed/f/original/2015/05/15/minions-filme.jpg" style="width: 350px; height: auto;" alt="Felicità">
      </div>
      
      <div style="background-color: #9400D3; width: 460px; height: 30px; margin-top: 20px; "></div>
    </div>
`
    };
    await service.sendEmail(deleteMailOptions);
    return { status: true, message: 'Success', cod: 200 };
};

async function DeleteCode(paramIdCode) {
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('DELETE FROM passwordrecoverycode WHERE id = ?', [paramIdCode])
    connectionBD.release();
    return { status: true, message: 'Success', cod: 200 };
}

async function ChangeVerifyed(paramCodeUser) {
    const connectionBD = await pool.pool.getConnection();
    await connectionBD.query('UPDATE passwordrecoverycode SET verified = 1 WHERE id = ?', [paramCodeUser])
    connectionBD.release();
    return { status: true, message: 'Success', cod: 200 };
};

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
        html: 
`
<div style="text-align: center; max-width: 460px;" >
      <div style="background-color: #9400D3; width: 100%; max-width: 460px; height: 30px; "></div>

      <div style="font-size: 22px; text-align: justify; max-width: 450px; padding: 2px; ">
        <h2 style="text-align: left; ">Ciao!</h2>
        <p>
          Stai ricevendo un'e-mail perché il tuo password sulla <br>
            <a href="https://logint-page-react.vercel.app/" style="font-style: italic;  color: #9400D3;">Pagina di Accesso</a> è stato modificato correttamente! 
        </p>
      </div>
      
      <div style="background-color: #9400D3; width: 460px; height: 30px; margin-top: 20px; "></div>
    </div>
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