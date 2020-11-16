import admin from 'firebase-admin';

const serviceAccount = require('./cred.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://ongqir-f67ad.firebaseio.com"
})


const notification_options = {
    priority: "high",
    timeToLive: 60 * 60 * 24
};

export {
    admin,
    notification_options
}