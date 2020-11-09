import nodemailer from 'nodemailer';

const account = nodemailer.createTestAccount();

let transporter = nodemailer.createTransport({
    host: account.smtp.host,
    port: account.smtp.port,
    secure: account.smtp.secure,
    auth: {
        user: account.user,
        pass: account.pass
    },
    logger: true,
    debug: false
});
const sendMail = (message) => {

    return transporter.sendMail(message, (err, info) => {
        if (err) {
            console.log('Error occurred. ' + err.message);
            return process.exit(1);
        }
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));

        transporter.close();
    });
}

let message = {
    from: 'kalleriakronos24@gmail.com',
    to: 'madacool22@gmail.com',
    subject: 'Nodemailer is unicode friendly ✔',
    text: 'Hello to myself!123',
    html: '<p><b>Hello</b> to myself!</p>'
};

export {
    sendMail
}