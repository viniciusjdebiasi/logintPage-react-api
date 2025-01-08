const nodemailer = require('nodemailer');
const { send } = require('vite');

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'debiasivj@gmail.com',
        pass: 'dgnr ddyz bznv cmnw'
    }
});

async function sendEmail(paramE, paramN) {
    const mailOptions = {
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

    try {
        const info = await transporter.sendMail(mailOptions);
        return { status: true, message: 'Email sent successfully', cod: 200, info };
    } catch (error) {
        return { status: false, message: 'Failed to send email', cod: 400, error };
    }
};

exports.sendEmail = sendEmail;