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
async function CreateHashPassword(paramP) {
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(paramP, saltRounds);
    return hashedPassword;
};

// comparar hash com senha
async function ComparePasswordHash(paramP, paramHP) {
    const isMatch = await bcrypt.compare(paramP, paramHP);
    return isMatch;
};

// criar data
async function CreateDate() {
    let date = new Date();
    let paramTI = `${date.getHours()}:${date.getMinutes()} ${date.getFullYear()}-${date.getUTCMonth() + 1}-${date.getUTCDate()}`;
    return paramTI;
}

exports.sendEmail = sendEmail;
exports.CreateHashPassword = CreateHashPassword;
exports.CreateDate = CreateDate;
exports.ComparePasswordHash = ComparePasswordHash;