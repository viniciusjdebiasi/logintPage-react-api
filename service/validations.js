const pool = require('./connection');
const bcrypt = require('bcrypt');

// valida existencia por ID
async function CheckUserID(param) {
    const connectionBD = await pool.pool.getConnection();
    if (isNaN(param)) {
        return { status: false, message: 'Invalid value reported', cod: 400 };
    } else {
        let [rows] = await connectionBD.query('SELECT id FROM users WHERE id = ?', [param]);
        connectionBD.release();
        if (rows.length > 0) {
            return { status: true, message: 'Success', cod: 200 };
        } else {
            return { status: false, message: 'Non-existent contact', cod: 400 };
        }
    }
};

// valida login por EMAIL e SENHA
async function CheckUserLogin(paramE, paramP) {
    const connectionBD = await pool.pool.getConnection();
    let [rows] = await connectionBD.query('SELECT id, password FROM users WHERE email = ?', [paramE]);
    connectionBD.release();
    if (rows.length > 0) {
        let id = rows[0].id;
        const hashedPassword = rows[0].password;
        const isMatch = await bcrypt.compare(paramP, hashedPassword);
        if (isMatch) {
            return { status: true, message: 'Success', cod: 200, idUser: id };
        } else {
            return { status: false, message: 'Incorrect password', cod: 400 };
        }
    } else {
        return { status: false, message: 'There is no user with this email', cod: 400 };
    }
};

// valida NOME
async function CheckName(paramN) {
    const nameRegex = /^[a-zA-ZÀ-ÿ\s]{2,}$/;
    let validName = nameRegex.test(paramN);
    if (validName) {
        return { status: true, message: 'Success', cod: 200 };
    } else {
        return { status: false, message: 'Invalid name', cod: 400 };
    }
};

// valida DATA
async function CheckDate(paramD, paramM, paramY) {
    const date = new Date();
    const year = date.getFullYear();
    let validD = paramD >= 1 && paramD <= 31;
    let validM = paramM >= 1 && paramM <= 12;
    let validY = paramY >= (year - 110) && paramY <= year;
    if (validD && validM && validY) {
        return { status: true, message: 'Success', cod: 200 };
    } else if (!validD) {
        return { status: false, message: 'Invalid day', cod: 400 };
    } else if (!validM) {
        return { status: false, message: 'Invalid month', cod: 400 };
    } else if (!validY) {
        return { status: false, message: 'Invalid year', cod: 400 };
    }
};

// valida EMAIL
async function CheckEmail(paramE) {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    let validEmail = emailRegex.test(paramE);
    if (validEmail) {
        const connectionBD = await pool.pool.getConnection();
        let [rows] = await connectionBD.query('SELECT id FROM users WHERE email = ?', [paramE]);
        connectionBD.release();
        if (rows.length > 0) {
            return { status: false, message: 'Email already registered', cod: 200 };
        } else {
            return { status: true, message: 'Success', cod: 200 };
        }
    } else {
        return { status: false, message: 'Invalid email', cod: 400 };
    }
};

// valida TELEFONE
async function CheckPhone(paramP) {
    const phoneRegex = /^\+?\d{9,15}$/;
    let validPhone = phoneRegex.test(paramP);
    if (validPhone) {
        return { status: true, message: 'Success', cod: 200 };
    } else {
        return { status: false, message: 'Invalid phone', cod: 400 };
    }
};

// valida SENHA
async function CheckPassword(paramP) {
    const passwordRules = [
        { passwordRegex: /[A-Z]/, message: "Must contain at least one capital letter" },
        { passwordRegex: /[a-z]/, message: "Must contain at least one lowercase letter" },
        { passwordRegex: /\d/, message: "Must contain at least one number" },
        { passwordRegex: /[@$!%*?&]/, message: "Must contain at least one special character (@$!%*?&)" },
        { passwordRegex: /.{8,}/, message: "Must be at least 8 characters long" }
    ];
    const errors = passwordRules.filter(rules => !rules.passwordRegex.test(paramP)).map(rules => rules.message)
    return errors.length > 0 ? { status: false, message: errors, cod: 400 } : { status: true, message: 'Success', cod: 200 };
};

// valida dados retornados por usuário
async function CheckValues(paramN, paramD, paramM, paramY, paramE, paramP, paramPW) {
    let checkName = await CheckName(paramN);
    let checkDate = await CheckDate(paramD, paramM, paramY);
    let checkEmail = await CheckEmail(paramE);
    let checkPhone = await CheckPhone(paramP);
    let checkPassword = await CheckPassword(paramPW);

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

exports.CheckUserID = CheckUserID;
exports.CheckUserLogin = CheckUserLogin;
exports.CheckValues = CheckValues;