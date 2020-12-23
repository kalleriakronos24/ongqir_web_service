import Model from '../models/default.model';
import bcrypt from 'bcrypt';
import uniqueString from 'unique-string';
import fs from 'fs';
import { isValidObjectId } from 'mongoose'
import moment from 'moment';
import nodemailer from 'nodemailer';
import { admin } from '../firebase/firebase-config';


class UserController extends Model {

    async addUser(req, res) {

        const User = super.user();

        const { name, email, type, password, nohp } = req.body;

        const uri = 'https' + '://' + req.get('host');

        const fotoKtpFilePath = req.files['fotoKtp'] !== undefined ? `${uri}/public/foto/${req.files['fotoKtp'][0].filename}` : null;
        const fotoDiriFilePath = req.files['fotoDiri'] !== undefined ? `${uri}/public/foto/${req.files['fotoDiri'][0].filename}` : null;
        const fotoSTNKFilePath = req.files['fotoSTNK'] !== undefined ? `${uri}/public/foto/${req.files['fotoSTNK'][0].filename}` : null;

        await User.findOne({ email }, async (err, user) => {

            // error check
            console.log('User Find Error:: ', err);

            // check wheter user exist or not
            if (user) {

                return res.json({
                    msg: 'Email Telah Digunakan',
                    code: 1
                })
            }


            let num = Math.floor(Math.random() * 899 + 100)

            // Generate SMTP service account from ethereal.email
            nodemailer.createTestAccount((err, account) => {
                if (err) {
                    console.error('Failed to create a testing account');
                    console.error(err);
                    return process.exit(1);
                }
                console.log('Credentials obtained, sending message...');

                // NB! Store the account object values somewhere if you want
                // to re-use the same account for future mail deliveries

                // Create a SMTP transporter object
                let transporter = nodemailer.createTransport(
                    {
                        auth: {
                            user: "ongqir@gmail.com",
                            pass: "Vanhallen5150!@#"
                        },
                        logger: true,
                        debug: false, // include SMTP traffic in the logs
                        service: 'gmail'
                    },
                    {
                        // default message fields
                        // sender info
                        from: 'ongqir@gmail.com'
                    }
                );

                // Message object

                let message = {
                    // Comma separated list of recipients
                    to: email,

                    // Subject of the message
                    subject: 'Onqir Email Verifikasi',

                    // plaintext body

                    // HTML body
                    html: `<p><b>Hello</b> dari Ongqir </p>
                            <p>Klik tombol verifikasi ini untuk memverifikasi : <br/><br/>
                            <br/>
                            <a style="border: 1px solid black; padding: 12px; background-color:blue; cursor:pointer; border-radius: 6px; text-align:center; color:white; font-size: 24; font-weight:bold;" href="https://www.ongqir-backend.com/verif?email=${email}">Verifikasi</a>
                            </p>`,
                }


                transporter.sendMail(message, (error, info) => {
                    if (error) {
                        console.log('Error occurred');
                        console.log(error.message);
                        return process.exit(1);
                    }

                    console.log('Message sent successfully!');
                    console.log(nodemailer.getTestMessageUrl(info));

                    // only needed when using pooled connections
                    transporter.close();
                });
            });

            await bcrypt.hash(password, 10, async (error, hash) => {
                console.log('password hash ::: ', hash);
                if (type === 'user') {
                    await User.create({
                        fullname: name,
                        email,
                        type: type,
                        password: hash,
                        token: 0,
                        foto_diri: fotoDiriFilePath,
                        no_hp: nohp,
                        account_created: moment().locale('id-ID').format('DD MMMM YYYY hh:mm'),
                        verif_code: num
                    }, (e, r) => {
                        console.log('Result:: ', r);
                        console.log('Error:: ', e);
                    });

                    return res.json({
                        msg: 'register succesfull',
                        error: false
                    })

                } else {
                    console.log('nothing to see here');

                    await User.create({
                        fullname: name,
                        email,
                        type: type,
                        password: hash,
                        foto_ktp: fotoKtpFilePath,
                        foto_diri: fotoDiriFilePath,
                        foto_stnk: fotoSTNKFilePath,
                        no_hp: nohp,
                        token: 0,
                        courier_info: {
                            status: false,
                            coords: {
                                latitude: 0,
                                longitude: 0
                            },
                            balance: 0
                        },
                        account_created: moment().locale('id-ID').format('DD MMMM YYYY hh:mm'),
                        verif_code: num
                    }, (e, r) => {
                        console.log('Result:: ', r);
                        console.log('Error:: ', e);
                    })
                    return res.json({
                        msg: 'courier register succesfull',
                        error: false
                    })
                }
            })
        })
    }

    async userLogin(req, res) {


        const User = super.user();

        const { email, password, token } = req.body;
        const tokenA = uniqueString();

        User.findOne({ email }, (err, user) => {
            if (user) {
                bcrypt.compare(password, user.password, (error, result) => {
                    if (result) {
                        return User.findOneAndUpdate({ email: email }, {
                            $set: {
                                "token": tokenA,
                                "device_token": token
                            }
                        }, (e, r) => {
                            if (r) {
                                return res.json({
                                    tokenA
                                })
                            } else {
                                return
                            }
                        })
                    } else {
                        return res.json({
                            msg: 'password do not match',
                            code: 'ERR_LOGIN_2'
                        })
                    }
                })
            } else {
                return res.json({
                    "msg": "failed to login",
                    "code": "ERR_LOGIN_1"
                })
            }
        })
    }

    async resetPassword(req, res, next) {

        const User = super.user();

        const { email, password } = req.body;

        await User.findOne({ email }, async (err, user) => {

            // error check
            console.log('User Find Error:: ', err);

            // check wheter user exist or not

            await bcrypt.hash(password, 10, async (error, hash) => {

                await User.updateOne({ _id: user._id }, {
                    $set: {
                        "password": hash
                    }
                })
                return res.json({
                    msg: 'register succesfull',
                    error: false
                })

            })

        })
    }

    async getUser(req, res, next) {

        try {
            const User = super.user();
            const Order = super.order();

            const { token } = req.params;

            await User.findOne({ token: token }, { verified: 1, fullname: 1, type: 1, token: 1, active_order: 1, courier_info: 1, no_hp: 1, user_order: 1, foto_diri: 1, foto_ktp: 1, email: 1 }, async (err, result) => {

                let successOrderUser = 0;

                await Order.aggregate([
                    {
                        $match: {
                            "from": result._id,
                            "status": true
                        }
                    },
                    {
                        $group: {
                            "_id": null,
                            "count": {
                                $sum: 1
                            }
                        }
                    }
                ])
                    .then(async res => {
                        if (res.length > 0) {
                            await (successOrderUser = res[0].count);
                        }
                        successOrderUser = 0;
                    })
                    .catch(err => {
                        console.log('something went wrong 2', err);
                    })

                if (result.type === 'user') {
                    await res.send({
                        msg: 'user data fetched from server',
                        error: false,
                        data: {
                            count: successOrderUser,
                            fullname: result.fullname,
                            type: result.type,
                            user_order: result.user_order,
                            token: result.token,
                            no_hp: result.no_hp,
                            fotoDiri: result.foto_diri,
                            type: result.type
                        }
                    })
                } else {

                    // fullname: string,
                    //     no_hp: string,
                    //         email: string,
                    //             fotoDiri: string,
                    //                 courier_info: {
                    //     balance: number
                    // },
                    // active_order: string

                    await res.send({
                        msg: 'courier data fetched from server',
                        error: false,
                        data: {
                            type: result.type,
                            fullname: result.fullname,
                            active_order: result.active_order,
                            no_hp: result.no_hp,
                            fotoDiri: result.foto_diri,
                            courier_info: result.courier_info,
                            email: result.email,
                            verified: result.verified
                        }
                    })
                }
            }, (er, reS) => {
                console.log('Result:: ', er);
                console.log('Error:: ', reS);
            })
        } catch (err) {
            throw new Error(err);
        }

    }

    async fetchAllCourier(req, res) {
        let User = super.user();

        try {
            await User.find({ type: 'courier' }, { verified: 1, foto_stnk: 1, fullname: 1, alamat: 1, email: 1, active_order: 1, foto_diri: 1, foto_ktp: 1, courier_info: 1 }, (err, result) => {
                return res.json(result);
            }, (error, r1) => {
                console.log('has error : ? ,', error);
                console.log('result ? :', r1);
            })
        }
        catch (err) {
            throw new Error(err);
        }
    }

    async setStatusUserToOnline(token, bool, socket_id) {

        let User = super.user();


        return User.updateOne({ token: token }, {
            $set: {
                "online": bool,
                "socket_id": socket_id
            }
        }, (err, res) => {
            //
        })
    }


    async updateCourierLocation(req, res) {

        let User = super.user();

        let { token, coords } = req.body;

        await User.updateOne({ token }, {
            $set: {
                "courier_info.coords": coords
            }
        }, (err, res1) => {
            return res.json({
                msg: 'success updating courier location'
            });
        })

    }

    async verifEmail(req, res) {

        // include database
        let User = super.user();


        // constants and variaables
        const { email } = req.query;

        // query
        await User.updateOne({ email }, {
            $set: {
                "verified": true
            }
        }, (err, er) => {
            console.log('failed during verify the user email', err);
            console.log('verify user email ', er);

            res.redirect('https://ongqir-website.vercel.app/');
        })
    }


    async logout(req, res) {

        let User = super.user();

        const { token } = req.body;

        console.log('token', req.body);
        await User.updateOne({ token }, {
            $set: {
                "online": false
            }
        }, (err, re) => {
            console.log('failed during verify the user email', err);
            console.log('verify user email ', re);

            return res.json({
                msg: 'success'
            })
        })
    }

    async updateDeviceToken(req, res) {

        let User = super.user();

        const notification_options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };


        const { device_token, token } = req.body;

        await User.updateOne({ token }, {
            $set: {
                "device_token": device_token
            }
        }, (err, res) => {
            console.log('error update device token ?', err);
            console.log('success update device token ?', res);
        })

        // return admin.messaging().sendToDevice(device_token, message, notification_options)
        //     .then(res => {
        //         console.log(res);

        //         console.log('successfully send to device ', device_token);

        //     })
        //     .catch(err => {
        //         console.log('error :: ', err);
        //     })
    }

    async testing(req, res) {

        let User = super.user();

        const notification_options = {
            priority: "high",
            timeToLive: 60 * 60 * 24
        };

        const { device_token, message } = req.body;

        return admin.messaging().sendToDevice(device_token, message, notification_options)
            .then(res => {
                console.log(res);
                console.log('successfully send to device ', device_token);
            })
            .catch(err => {
                console.log('error :: ', err);
            })
    }

    async resendVerifEmail(req, res) {

        // include database
        let User = super.user();


        // constants and variaables
        const { email } = req.body;

        // query

        nodemailer.createTestAccount(async (err, account) => {
            if (err) {
                console.error('Failed to create a testing account');
                console.error(err);
                return process.exit(1);
            }
            console.log('Credentials obtained, sending message...');

            // NB! Store the account object values somewhere if you want
            // to re-use the same account for future mail deliveries

            // Create a SMTP transporter object
            let transporter = nodemailer.createTransport(
                {
                    auth: {
                        user: "ongqir@gmail.com",
                        pass: "Vanhallen5150!@#"
                    },
                    logger: true,
                    debug: false, // include SMTP traffic in the logs
                    service: 'gmail',
                    secure: true
                },
                {
                    // default message fields
                    // sender info
                    from: 'ongqir@gmail.com'
                }
            );

            // Message object

            let message = {
                // Comma separated list of recipients
                to: email,

                // Subject of the message
                subject: 'Onqir Email Verifikasi',

                // plaintext body

                // HTML body
                html: `<p><b>Hello</b> dari Ongqir </p>
                            <p>Klik tombol verifikasi ini untuk memverifikasi : <br/><br/>
                            <br/>
                            <a style="border: 1px solid black; padding: 12px; background-color:blue; cursor:pointer; border-radius: 6px; text-align:center; color:white; font-size: 24; font-weight:bold;" href="https://www.ongqir-backend.com/verif?email=${email}">Verifikasi</a>
                            </p>`,
            };


            transporter.sendMail(message, (error, info) => {

                if (error) {
                    console.log('Error occurred');
                    console.log(error.message);

                    res.json({
                        msg: "Gagal mengirim link verifikasi ke email anda, coba lagi",
                        code: 1
                    })
                    return process.exit(1);
                }

                console.log('Message sent successfully!');
                console.log(nodemailer.getTestMessageUrl(info));

                res.json({
                    msg: "link verifikasi telah dikirim ulang ke email " + email,
                    code: 0
                })


                // only needed when using pooled connections
                transporter.close();
            });
        });
    }
}

export default UserController;
