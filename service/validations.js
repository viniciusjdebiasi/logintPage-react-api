const pool = require('./connection');
const service = require('./services');
const funct = require('./functions');

async function CheckUserID(paramId) {
    if (isNaN(paramId)) {
        return { status: false, message: 'Invalid value reported', cod: 400 };
    } else {
        const connectionBD = await pool.pool.getConnection();
        const [rows] = await connectionBD.query('SELECT id FROM users WHERE id = ?', [paramId]);
        connectionBD.release();
        if (rows.length > 0) {
            return { status: true, message: 'Success', cod: 200 };
        } else {
            return { status: false, message: 'Non-existent contact', cod: 400 };
        }
    }
};

async function CheckUserLogin(paramEmail, paramPassword) {
    const connectionBD = await pool.pool.getConnection();
    const [rows] = await connectionBD.query('SELECT * FROM users WHERE email = ?', [paramEmail]);
    connectionBD.release();
    if (rows.length > 0) {
        const id = rows[0].id;
        const hashedPassword = rows[0].password;
        const compareHshed = await service.CompareHash(paramPassword, hashedPassword);
        if (compareHshed) {
            return { status: true, message: 'Success', cod: 200, idUser: id };
        } else {
            return { status: false, message: 'Password errata', cod: 400 };
        }
    } else {
        return { status: false, message: "Non c'è nessun utente con questa email", cod: 400 };
    }
};

async function NewXOldPassword(paramNewPassword, paramEmail) {
    const connectionBD = await pool.pool.getConnection();
    const [result] = await connectionBD.query('SELECT password FROM users WHERE email = ?', [paramEmail]);
    const oldUserPassword = result[0].password;
    const compareHash = await service.CompareHash(paramNewPassword, oldUserPassword);
    if (compareHash) {
        return { status: false, message: 'La password attuale è la stessa della precedente', cod: 400 }
    } else {
        return { status: true, message: 'Success', cod: 200 };
    }
};

async function CheckName(paramName) {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,}$/;
    const validName = nameRegex.test(paramName);
    if (validName) {
        return { status: true, message: 'Success', cod: 200 };
    } else {
        return { status: false, message: 'Nome non valido', cod: 400 };
    }
};

async function CheckDate(paramDay, paramMonth, paramYear) {
    const date = new Date();
    const year = date.getFullYear();
    const validDay = paramDay >= 1 && paramDay <= 31;
    const validMonth = paramMonth >= 1 && paramMonth <= 12;
    const validYear = paramYear >= (year - 110) && paramYear <= year;
    if (validDay && validMonth && validYear) {
        return { status: true, message: 'Success', cod: 200 };
    } else if (!validDay) {
        return { status: false, message: 'Giorno non valido', cod: 400 };
    } else if (!validMonth) {
        return { status: false, message: 'Mese non valido', cod: 400 };
    } else if (!validYear) {
        return { status: false, message: 'Anno non valido', cod: 400 };
    }
};

async function ValidEmail(paramEmail) {
    const connectionBD = await pool.pool.getConnection();
    const [rows] = await connectionBD.query('SELECT * FROM users WHERE email = ?', [paramEmail]);
    connectionBD.release();
    if (rows.length > 0) {
        return { status: false, message: 'Email già registrata', cod: 400 };
    } else {
        return { status: true, message: 'Success', cod: 200 };
    }
};

async function CheckEmail(paramEmail) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    const validEmail = emailRegex.test(paramEmail);
    if (validEmail) {
        const checkEmail = await ValidEmail(paramEmail);
        if (checkEmail.cod == 400) {
            return checkEmail;
        } else {
            return checkEmail;
        }
    } else {
        return { status: false, message: 'Email non valida', cod: 400 };
    }
};

async function CheckPhone(paramPhone) {
    const phoneRegex = /^\+?\d{9,15}$/;
    const validPhone = phoneRegex.test(paramPhone);
    if (validPhone) {
        return { status: true, message: 'Success', cod: 200 };
    } else {
        return { status: false, message: 'Telefono non valido', cod: 400 };
    }
};

async function CheckPassword(paramPassword) {
    const param = 6
    const validPassword = paramPassword.length >= param;
    if(validPassword) {
        return { status: true, message: 'Success', cod: 200 };
    }
    else {
        return { status: false, message: 'La password deve contenere almeno 6 caratteri', cod: 400 };
    }
};

async function CheckValues(paramName, paramDay, paramMonth, paramYear, paramEmail, paramPhone, paramPassword) {
    const checkName = await CheckName(paramName);
    const checkDate = await CheckDate(paramDay, paramMonth, paramYear);
    const checkEmail = await CheckEmail(paramEmail);
    const checkPhone = await CheckPhone(paramPhone);
    const checkPassword = await CheckPassword(paramPassword);

    if (checkName.status && checkDate.status && checkEmail.status && checkPhone.status && checkPassword.status) {
        return { status: true, message: 'Success', cod: 200 };
    } else if (!checkName.status) {
        return checkName;
    } else if (!checkDate.status) {
        return checkDate;
    } else if (!checkEmail.status) {
        return checkEmail;
    } else if (!checkPhone.status) {
        return checkPhone;
    } else if (!checkPassword.status) {
        return checkPassword;
    }
};

async function CheckUserCode(paramCU, paramE) {
    const user = await funct.SelectUserEmail(paramE)
    const hashUser = user.message[0].code;
    const check = await service.CompareHash(paramCU, hashUser);
    if (check) {
        const idCodeUser = user.message[0].idcode;
        return { status: true, message: 'Success', cod: 200, code: idCodeUser };
    } else {
        return { status: false, message: 'Codice non valido', cod: 400 };
    }
};

async function CheckEmailCodeUser(paramEmail) {
    const checkEmail = await ValidEmail(paramEmail);
    if (checkEmail.cod == 400) {
        const result = await funct.SelectUserEmail(paramEmail);
        const userCode = result.message[0].code;
        if (userCode === null || userCode === '') {
            return { status: false, message: "Non c'è alcun codice per l'email inviata", cod: 400 };
        } else {
            return { status: true, message: 'Success', cod: 200 };
        }
    } else {
        return { status: false, message: 'Email non valida', cod: 401 };
    }
};

async function CheckVerified(paramEmail) {
    const result = await funct.SelectUserEmail(paramEmail);
    const verifiedCode = result.message[0].verified;
    if (verifiedCode === 1) {
        const userCode = result.message[0].iduser;
        const idCode = result.message[0].idcode;
        return { status: true, message: 'Success', cod: 200, userCode: userCode, idCode: idCode };
    } else {
        return { status: false, message: 'Email non abilitata per cambiare password', cod: 400 };
    }
};

exports.CheckPassword = CheckPassword;
exports.CheckUserID = CheckUserID;
exports.CheckUserLogin = CheckUserLogin;
exports.CheckValues = CheckValues;
exports.ValidEmail = ValidEmail;
exports.CheckUserCode = CheckUserCode;
exports.CheckEmailCodeUser = CheckEmailCodeUser;
exports.CheckVerified = CheckVerified;
exports.NewXOldPassword = NewXOldPassword;