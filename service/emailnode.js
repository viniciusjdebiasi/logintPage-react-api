const nodemailer = require('nodemailer');


const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'debiasivj@gmail.com',
        pass: 'dgnr ddyz bznv cmnw'
    }
});

async function sendEmail(paramMO) {
    const mailOptions = paramMO;

    try {
        const info = await transporter.sendMail(mailOptions);
        return { status: true, message: 'Email sent successfully', cod: 200, info };
    } catch (error) {
        return { status: false, message: 'Failed to send email', cod: 400, error };
    }
};

exports.sendEmail = sendEmail;