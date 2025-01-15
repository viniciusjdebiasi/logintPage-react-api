const nodemailer = require('nodemailer');
const bcrypt = require('bcrypt');

// parametros emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'debiasivj@gmail.com',
        pass: 'dgnr ddyz bznv cmnw'
    }
});

// enviar email
async function sendEmail(paramMO) {
    const mailOptions = paramMO;

    try {
        const info = await transporter.sendMail(mailOptions);
        return { status: true, message: ['Email sent successfully', info], cod: 200 };
    } catch (error) {
        return { status: false, message: ['Failed to send email', error], cod: 400 };
    }
};

// criar hash para senha
async function CreateHash(paramP) {
    const saltRounds = 10;
    const hashed = await bcrypt.hash(String(paramP), saltRounds);
    return hashed;
};

// comparar hash
async function CompareHash(paramC, paramCH) {
    const isMatch = await bcrypt.compare(paramC, paramCH);
    return isMatch;
};

// criar data
async function CreateDate() {
    let date = new Date();
    let paramTI = `${date.getHours()}:${date.getMinutes()} ${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    return paramTI;
}

// criar código
async function CreateCode() {
    const min = 100000;
    const max = 999999;
    const code = Math.floor(Math.random() * (max - min + 1)) + min;
    const hashCode = await CreateHash(code);
    return {hash: hashCode, userCode: code};
};

exports.sendEmail = sendEmail;
exports.CreateHash = CreateHash;
exports.CreateDate = CreateDate;
exports.CompareHash = CompareHash;
exports.CreateCode = CreateCode;