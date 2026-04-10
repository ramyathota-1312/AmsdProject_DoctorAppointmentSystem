const nodemailer = require('nodemailer');

// Create reusable transporter object using the default SMTP transport
const transporter = nodemailer.createTransport({
    host: 'smtp.ethereal.email',
    port: 587,
    auth: {
        user: 'lilla.langosh@ethereal.email', // This is a temporary dummy account just for checking
        pass: '6B4XGzDZmPtdkRSTmU'
    }
});

const sendEmail = async (options) => {
    try {
        const info = await transporter.sendMail({
            from: '"DocBook App" <no-reply@docbook.com>', // sender address
            to: options.email, // list of receivers
            subject: options.subject, // Subject line
            text: options.message, // plain text body
            html: options.htmlMessage, // html body
        });

        console.log("Message sent: %s", info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error("Error sending email", error);
    }
};

module.exports = sendEmail;
