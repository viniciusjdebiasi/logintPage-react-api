const pool = require('./connection');
const service = require('./services');
const funct = require('./functions');

// valida existencia por ID
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

// valida login por EMAIL e SENHA
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
            return { status: false, message: 'Incorrect password', cod: 400 };
        }
    } else {
        return { status: false, message: 'There is no user with this email', cod: 400 };
    }
};

// valida senha antiga x senha atual
async function NewXOldPassword(paramNewPassword, paramEmail) {
    const connectionBD = await pool.pool.getConnection();
    const [result] = await connectionBD.query('SELECT password FROM users WHERE email = ?', [paramEmail]);
    console.log(result, 'aqui')
    const oldUserPassword = result[0].password;
    const compareHash = await service.CompareHash(paramNewPassword, oldUserPassword);
    if(compareHash) {
        return { status: false, message: 'Current password is the same as the previous one', cod: 400 }
    } else {
        return { status: true, message: 'Success', cod: 200 };
    }
};

// valida NOME
async function CheckName(paramName) {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,}$/;
    const validName = nameRegex.test(paramName);
    if (validName) {
        return { status: true, message: 'Success', cod: 200 };
    } else {
        return { status: false, message: 'Invalid name', cod: 400 };
    }
};

// valida DATA
async function CheckDate(paramDay, paramMonth, paramYear) {
    const date = new Date();
    const year = date.getFullYear();
    const validDay = paramDay >= 1 && paramDay <= 31;
    const validMonth = paramMonth >= 1 && paramMonth <= 12;
    const validYear = paramYear >= (year - 110) && paramYear <= year;
    if (validDay && validMonth && validYear) {
        return { status: true, message: 'Success', cod: 200 };
    } else if (!validDay) {
        return { status: false, message: 'Invalid day', cod: 400 };
    } else if (!validMonth) {
        return { status: false, message: 'Invalid month', cod: 400 };
    } else if (!validYear) {
        return { status: false, message: 'Invalid year', cod: 400 };
    }
};

// valida existencia do email
async function ValidEmail(paramEmail) {
    const connectionBD = await pool.pool.getConnection();
    const [rows] = await connectionBD.query('SELECT * FROM users WHERE email = ?', [paramEmail]);
    connectionBD.release();
    if (rows.length > 0) {
        return { status: false, message: 'Email already registered', cod: 400 };
    } else {
        return { status: true, message: 'Success', cod: 200 };
    }
};

// valida EMAIL
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
        return { status: false, message: 'Invalid email', cod: 400 };
    }
};

// valida TELEFONE
async function CheckPhone(paramPhone) {
    const phoneRegex = /^\+?\d{9,15}$/;
    const validPhone = phoneRegex.test(paramPhone);
    if (validPhone) {
        return { status: true, message: 'Success', cod: 200 };
    } else {
        return { status: false, message: 'Invalid phone', cod: 400 };
    }
};

// valida SENHA
async function CheckPassword(paramPassword) {
    const passwordRules = [
        { passwordRegex: /[A-Z]/, message: "Must contain at least one capital letter" },
        { passwordRegex: /[a-z]/, message: "Must contain at least one lowercase letter" },
        { passwordRegex: /\d/, message: "Must contain at least one number" },
        { passwordRegex: /[@$!%*?&]/, message: "Must contain at least one special character (@$!%*?&)" },
        { passwordRegex: /.{8,}/, message: "Must be at least 8 characters long" }
    ];
    const errors = passwordRules.filter(rules => !rules.passwordRegex.test(paramPassword)).map(rules => rules.message)
    return errors.length > 0 ? { status: false, message: errors, cod: 400 } : { status: true, message: 'Success', cod: 200 };
};

// valida dados retornados por usuário
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

// valida código usuário para alterar senha
async function CheckUserCode(paramCU, paramE) {
    let user = await funct.SelectUserEmail(paramE)
    let hashUser = user.message[0].code;
    let check = await service.CompareHash(paramCU, hashUser);
    if (check) {
        let idCodeUser = user.message[0].idcode;
        return { status: true, message: 'Success CheckUserCode', cod: 200, code: idCodeUser };
    } else {
        return { status: false, message: 'Invalid code', cod: 400 };
    }
};

// valida email x código
async function CheckEmailCodeUser(paramEmail) {
    const checkEmail = await ValidEmail(paramEmail);
    if (checkEmail.cod == 400) {
        const result = await funct.SelectUserEmail(paramEmail);
        const userCode = result.message[0].code;
        if (userCode === null || userCode === '') {
            return { status: false, message: 'There is no code for the email sent', cod: 400 };
        } else {
            return { status: true, message: 'Success', cod: 200 };
        }
    } else {
        return { status: false, message: 'Ivalid email', cod: 401 };
    }
};

// valida vefificado = 1 ou 0
async function CheckVerified(paramEmail) {
    const result = await funct.SelectUserEmail(paramEmail);
    const verifiedCode = result.message[0].verified;
    if(verifiedCode === 1) {
        const userCode = result.message[0].iduser;
        const idCode = result.message[0].idcode;
        return { status: true, message: 'Success', cod: 200, userCode: userCode, idCode: idCode };
    } else {
        return { status: false, message: 'Email not enabled to change password', cod: 400 };
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