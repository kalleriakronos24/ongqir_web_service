import Model from '../models/default.model';
import uniqueString from 'unique-string';
import { isValidObjectId } from 'mongoose'
import isPointWithinRadius from 'geolib/es/isPointWithinRadius';
import findNearest from 'geolib/es/findNearest';
import moment from 'moment-timezone';
const socketIo = require('socket.io');
import {
    admin,
    notification_options
} from '../firebase/firebase-config';

const addOrderToCourier = (a, db, dbUser, data, item, userid, pickupDetail, ongkir, brg, distance) => {

    const Order = db;
    const User = dbUser;

    return Order.create({
        order_id: moment().tz('Asia/Kuala_Lumpur').format('DD/MM/YY') + '/' + Math.round(Math.random() * 9999),
        from: userid,
        courier: data._id,
        penerima: item,
        pengirim: pickupDetail,
        ongkir: ongkir,
        order_date: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
        barang_yg_dikirim: brg,
        distance: distance
    })
        .then(async (result) => {

            // await User.findOne({ _id: result.from }, async (e1, r1) => {
            //     await User.findOne({ _id: result.courier }, async (e2, r2) => {
            //         let obj = {
            //             items: result.item,
            //             courier: r2,
            //             user: r1,
            //             id: result.order_id,
            //             date: result.item[0].date,
            //             _id: result._id,
            //             tipe: result.tipe
            //         }
            //         const io = socketIo('http://192.168.43.178:8000/courier/order/get', {
            //             transports: ['websocket']
            //         });

            //         io.to(r2.socket_id).emit('sendOrderToCourier', obj);
            //     });
            // });

            await User.updateOne({ _id: data._id }, {
                $set: {
                    "active_order": result._id,
                    "courier_info.status": true
                }
            }, (err, res) => {
                console.log('ERR :: ', err);
                console.log('Result :: ', res);
            })

            await User.updateOne({ _id: userid }, {
                $set: {
                    "user_order": result._id,
                    "canceled_from": ""
                }
            }, (err, res) => {
                console.log('ERR user  :: ', err);
                console.log('Result user :: ', res);
            })

        })
        .catch((er) => {
            throw new Error(er)
        })
}

class OrderController extends Model {

    async addOrder(req, res, next) {

        let Order = super.order();
        let User = super.user();

        const { token, penerima, pengirim, ongkirz, brg, distance } = req.body;

        const ongkir = ongkirz;

        console.log('req body :: ', req.body);

        const ongkirInRp = ongkir * (15 / 100);

        await User.findOne({ token: token }, async (err, result) => {

            let userObjID = result._id;

            if (result.canceled_from) {

                console.log('user tidak dapat mengorder dari ke kurir id ', result.canceled_from);
                await User.find({ _id: { $ne: result.canceled_from }, type: 'courier', "courier_info.status": false, "courier_info.balance": { $gte: ongkirInRp }, verified: true }, async (er, courierData) => {

                    if (courierData.length !== 0) {

                        const nearestCourier = findNearest({ latitude: pengirim.coords.latitude, longitude: pengirim.coords.longitude }, [...courierData.map((x, y) => x.courier_info.coords)]);

                        const { latitude, longitude } = nearestCourier;
                        // console.log('nearest coordinate :: ', nearestCourier);

                        return User.findOne({ "courier_info.coords.latitude": latitude, "courier_info.coords.longitude": longitude }, {}, async (e, r) => {
                            // console.log('nearest courier Data ::: ', r);

                            if (Object.keys(r).length !== 0) {


                                const notification_options = {
                                    priority: "high",
                                    timeToLive: 60 * 60 * 24
                                };

                                let message = {
                                    data: {
                                        title: 'Orderan Masuk',
                                        subtext: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
                                        dari: result.fullname,
                                        ongkir: String(ongkir),
                                        km: String(distance),
                                        barang: brg
                                    }
                                };


                                addOrderToCourier(res, Order, User, r, penerima, userObjID, pengirim, ongkirz, brg, distance);

                                admin.messaging().sendToDevice(r.device_token, message, notification_options)
                                    .then(async res => {
                                        console.log('successfully send to device ', r.device_token);
                                    })
                                    .catch(err => {
                                        console.log('error :: ', err);
                                    })

                                return res.json({
                                    data: null,
                                    _id: r._id,
                                    token: r.token
                                });

                            } else {
                                return res.json({
                                    msg: 'no nearest courier found',
                                    return: true
                                })
                            }
                        })
                    } else {
                        console.log('nearest courier not found ');
                        return res.json({
                            msg: 'no nearest courier found',
                            return: true
                        })
                    }
                })
            } else {
                await User.find({ type: 'courier', "courier_info.status": false, "courier_info.balance": { $gte: ongkirInRp }, verified: true }, async (er, courierData) => {

                    if (courierData.length !== 0) {
                        const nearestCourier = findNearest({ latitude: pengirim.coords.latitude, longitude: pengirim.coords.longitude }, [...courierData.map((x, y) => x.courier_info.coords)]);

                        const { latitude, longitude } = nearestCourier;
                        // console.log('nearest coordinate :: ', nearestCourier);

                        return User.findOne({ "courier_info.coords.latitude": latitude, "courier_info.coords.longitude": longitude }, {}, async (e, r) => {
                            // console.log('nearest courier Data ::: ', r);

                            if (Object.keys(r).length !== 0) {


                                const notification_options = {
                                    priority: "high",
                                    timeToLive: 60 * 60 * 24
                                };

                                let message = {
                                    data: {
                                        title: 'Orderan Masuk',
                                        subtext: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
                                        dari: result.fullname,
                                        ongkir: String(ongkir),
                                        km: String(distance),
                                        barang: brg
                                    }
                                };


                                console.log('COURIER DEVICE TOKEN', r.device_token);

                                addOrderToCourier(res, Order, User, r, penerima, userObjID, pengirim, ongkirz, brg, distance);

                                admin.messaging().sendToDevice(r.device_token, message, notification_options)
                                    .then(async res => {
                                        console.log('successfully send to device ', r.device_token);

                                    })
                                    .catch(err => {
                                        console.log('error :: ', err);
                                    })

                                return res.json({
                                    data: null,
                                    _id: r._id,
                                    token: r.token
                                });


                            } else {
                                return res.json({
                                    msg: 'no nearest courier found',
                                    return: true
                                })
                            }
                        })
                    } else {
                        console.log('nearest courier not found ');
                        return res.json({
                            msg: 'no nearest courier found',
                            return: true
                        })
                    }
                })
            }
        })
    }


    async getAllOrderByUser(req, res) {

        let User = super.user();
        let Order = super.order();

        let { token } = req.body;


        await User.findOne({ token: token }, async (error, result) => {

            let count = 0;
            let transaksi = 0;
            Order.aggregate([
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
                        },
                        "transaksi": {
                            $sum: "$ongkir"
                        }
                    }
                }
            ]).then(async res => {
                await (count = res[0].count);
                await (transaksi = res[0].transaksi);
            })
                .catch(err => {
                    console.log('ada error')
                })


            if (result) {
                await Order.find({ from: result._id }, (err, resu) => {
                    return res.json({
                        items: resu,
                        user: result,
                        count: count,
                        transaksi: transaksi
                    })
                })
            } else {
                return res.sendStatus(404);
            }
        })
    }

    async getAllOrderByCourier(req, res) {

        let User = super.user();
        let Order = super.order();

        let { token } = req.body;


        await User.findOne({ token: token }, async (error, result) => {

            let count = 0;
            let transaksi = 0;
            Order.aggregate([
                {
                    $match: {
                        "courier": result._id,
                        "status": true
                    }
                },
                {
                    $group: {
                        "_id": null,
                        "count": {
                            $sum: 1
                        },
                        "transaksi": {
                            $sum: "$ongkir"
                        }
                    }
                }
            ]).then(async res => {
                await (count = res[0].count);
                await (transaksi = res[0].transaksi);
            })
                .catch(err => {
                    console.log('ada error')
                })


            if (result) {
                await Order.find({ courier: result._id }, (err, resu) => {
                    return res.json({
                        items: resu,
                        data: result,
                        count: count,
                        transaksi: transaksi * (15 / 100)
                    })
                })
            } else {
                return res.sendStatus(404);
            }
        })
    }

    async getAllOrderDoneByCourier(req, res) {

        let User = super.user();
        let Order = super.order();

        let { token } = req.body;


        await User.findOne({ token: token, type: 'courier' }, async (error, result) => {
            console.log('errror', error);
            if (result) {
                await Order.findOne({ courier: result._id, status: true }, (err, resu) => {
                    if (resu) {
                        return User.findOne({ _id: resu.courier })
                            .populate('from')
                            .exec((err, re1) => {
                                return res.json({
                                    items: re1.item,
                                    courier: result,
                                    userData: re1.from
                                })
                            });
                    } else {
                        return res.json({
                            err: true,
                            msg: 'you dont have orders cleared yet'
                        });
                    }
                })

            } else {
                return res.sendStatus(404);
            }
        })
    };

    async getCourier(req, res, next) {

        const { coords } = req.body;

        let User = super.user();
        const meter = 1000;

        User.find({ type: 'courier' }, (err, result) => {
            result.map((v, i) => {
                const nearestCourier = findNearest({ latitude: coords.lat, longitude: coords.long }, [...result.map((x, y) => x.courier_info.coords)]);
                const { latitude, longitude } = nearestCourier;
                console.log('nearest coordinate :: ', nearestCourier);
                console.log('nearestt ::: ', findNearest({ latitude: coords.lat, longitude: coords.long }, [...result.map((x, y) => x.courier_info.coords)]));
                User.find({ "courier_info.coords.latitude": latitude, "courier_info.coords.longitude": longitude, "courier_info.status": false }, (e, r) => {
                    res.send({
                        data: r
                    })
                })
            })
        })

    }

    async getUserOrder(req, res) {

        let User = super.user();
        let Order = super.order();

        let { token } = req.body;

        console.log(req.body);

        await User.findOne({ token: token }, async (error, result) => {

            if (result) {

                await Order.findOne({ _id: result.user_order, status: false }, (err, resu) => {

                    if (resu) {

                        return User.findOne({ _id: resu.from }, (e1, r1) => {
                            return User.findOne({ _id: resu.courier }, (e2, r2) => {
                                return res.json({
                                    penerima: resu.penerima,
                                    courier: r2,
                                    pengirim: resu.pengirim,
                                    delivery_status: resu.delivery_status,
                                    id: resu._id,
                                    cancelable: resu.cancelable,
                                    ongkir: resu.ongkir,
                                    barang: resu.barang_yg_dikirim,
                                    user: r1,
                                    kurir_accept: resu.kurir_accept,
                                    is_kurir_cancel: resu.courier_cancel
                                })
                            })
                        });

                    } else {
                        return User.findOne({ token }, (e1, r1) => {
                            return res.json({
                                user: r1,
                                msg: 'not found',
                            })
                        })
                    }
                })
            } else {
                return res.sendStatus(404);
            }
        })
    }

    async setAlasanUser(req, res) {

        let Order = super.order();
        let User = super.user();

        const { id, alasan, user_id, courier_id } = req.body;

        await Order.updateOne({ _id: id }, {
            $set: {
                "alasan_user": alasan,
                "user_cancel": true
            }
        }, async (err, res1) => {
            console.log('error kirim alasan ,', err);
            console.log('berhasil kirim alasan ,', res1);

            await User.updateOne({ _id: user_id }, {
                $set: {
                    "user_order": null,
                    "canceled_from": courier_id
                },
                $addToSet: {
                    "history_order": id
                }
            }, async (err, result) => {

                const notification_options = {
                    priority: "high",
                    timeToLive: 60 * 60 * 24
                };

                await Order.findOne({ _id: id }, async (error, orderData) => {

                    await User.findOne({ _id: orderData.from }, async (error, userData) => {

                        let message = {
                            data: {
                                title: 'Orderan Di Batalkan',
                                subtext: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
                                dari: userData.fullname,
                                alasan: orderData.alasan_user,
                                type: 'ORDER_DIBATALKAN_USER'
                            }
                        };

                        await User.findOne({ _id: orderData.courier }, async (error, courierData) => {

                            await admin.messaging().sendToDevice(courierData.device_token, message, notification_options)
                                .then(async res => {
                                    console.log('successfully send to device ', courierData.device_token);
                                })
                                .catch(err => {
                                    console.log('error :: ', err);
                                })
                        })

                    })
                });

                return res.json({
                    msg: 'success canceled'
                })
            })
        });
    };

    async setCancelCourierOrder(req, res) {

        let Order = super.order();
        let User = super.user();


        const { id } = req.body;

        await Order.updateOne({ _id: id }, {
            $set: {
                "courier_cancel": true,
                "status": false
            }
        }, async (err, res1) => {
            console.log('error kirim alasan ,', err);
            console.log('berhasil kirim alasan ,', res1);

            await Order.findOne({ _id: id }, async (err, r) => {

                if (Object.keys(r).length !== 0) {

                    await User.updateOne({ _id: r.courier }, {
                        $set: {
                            "active_order": null,
                            "courier_info.status": false
                        },
                        $addToSet: {
                            "history_order": r._id
                        },
                    }, async (e1, r1) => {
                        console.log('courier status update error ? ', e1);
                        console.log('courier status update result ? ', r1)


                        const notification_options = {
                            priority: "high",
                            timeToLive: 60 * 60 * 24
                        };

                        await Order.findOne({ _id: id }, async (error, orderData) => {

                            await User.findOne({ _id: orderData.courier }, async (error, courierData) => {

                                let message = {

                                    data: {
                                        title: 'Orderan Di Batalkan',
                                        subtext: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
                                        dari: courierData.fullname,
                                        alasan: "Dengan Suatu Alasan",
                                        type: 'ORDER_DIBATALKAN_KURIR'
                                    }
                                };

                                await User.findOne({ _id: orderData.from }, async (error, userData) => {

                                    await admin.messaging().sendToDevice(userData.device_token, message, notification_options)
                                        .then(async res => {
                                            console.log('successfully send to device ', userData.device_token);
                                        })
                                        .catch(err => {
                                            console.log('error :: ', err);
                                        })
                                })

                            })
                        });



                        return res.send({
                            error: false,
                            msg: 'success canceled'
                        })
                    })

                }
            })
        })
    }

    async getCurrentOrderCourier(req, res) {

        let User = super.user();
        let Order = super.order();

        let { token } = req.body;


        await User.findOne({ token: token, type: 'courier' }, async (error, result) => {

            if (result) {
                await Order.findOne({ _id: result.active_order, status: false }, (err, resu) => {
                    console.log('error ? :: ', err);

                    if (resu) {
                        console.log('found ?');
                        return User.findOne({ _id: resu.from }, (e1, r1) => {
                            return User.findOne({ _id: resu.courier }, (e2, r2) => {
                                return res.json({
                                    pengirim: resu.pengirim,
                                    penerima: resu.penerima,
                                    courier: r2,
                                    user: r1,
                                    id: resu.order_id,
                                    date: resu.order_date,
                                    _id: resu._id,
                                    delivery_status: resu.delivery_status,
                                    user_cancel: resu.user_cancel,
                                    alasan: resu.alasan_user || "",
                                    online: r2.online,
                                    ongkir: resu.ongkir,
                                    barang: resu.barang_yg_dikirim,
                                    kurir_accept: resu.kurir_accept
                                })
                            })
                        });
                    } else {
                        User.findOne({ token }, (e2, r2) => {
                            return res.json({
                                msg: true,
                                online: r2.online
                            })
                        })
                    }
                })

            } else {
                return
            }
        })
    }



    async setDoneSingleOrder(req, res, next) {


        let User = super.user();
        let Order = super.order();

        let { token, id, order_id } = req.body;

        await Order.findOne({ _id: order_id }, async (e, r) => {

            await Order.findOne({ _id: r._id, status: false, delivery_status: 'sedang di antar' }, async (ee1, rr1) => {

                await User.findOne({ _id: r.courier }, async (ee2, rr2) => {

                    const walletUser = rr2.courier_info.balance;

                    console.log('rr1', rr1);
                    console.log('rr2', rr2);

                    await User.updateOne({ _id: rr2._id }, {
                        $set: {
                            "courier_info.balance": (walletUser - (rr1.ongkir * (15 / 100))) < 0 ? 0 : (walletUser - (rr1.ongkir * (15 / 100))) // if couriers wallet minus by a orders ongkir % 15 equal to less than 0 then put 0 else actual number of couriers wallet - a orders ongkir % 15
                        }
                    }, (ee, rr) => {
                        console.log('ada error nge update wallet si kurir ', ee);
                        console.log('berhasil mengupdate wallet si kurir ', rr);
                    });
                })
            });

            await User.updateOne({ _id: r.courier }, {
                $set: {
                    "active_order": null,
                    "courier_info.status": false
                },
                $addToSet: {
                    "history_order": r._id
                },
            }, async (e1, r1) => {
                console.log('courier status update error ? ', e1);

                console.log('courier status update result ? ', r1)

                await Order.updateOne({ _id: order_id, delivery_status: 'sedang di antar', status: false }, {
                    $set: {
                        "status": true,
                        'delivery_status': 'barang sudah diterima',
                        "waktu_barang_terkirim": moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm')
                    }
                }, async (err, resu) => {
                    console.log('order status update error ? ', err);
                    console.log('order status update result ? ', resu);

                    return res.json({
                        msg: 'success updated order status to done|true'
                    })
                })
            })

            await User.updateOne({ _id: r.from }, {
                $set: {
                    "user_order": null
                },
                $addToSet: {
                    "history_order": r._id
                }
            }, async (e2, r2) => {

                await Order.findOne({ _id: order_id }, async (error, orderData) => {

                    await User.findOne({ _id: orderData.courier }, async (error, courierData) => {

                        let message = {

                            data: {
                                title: 'Orderan Telah Sampai ke Penerima',
                                subtext: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
                                dari: courierData.fullname,
                                ongkir: String(orderData.ongkir),
                                barang: orderData.barang_yg_dikirim,
                                type: 'ORDERAN_SELESAI_DIKIRIM'
                            }
                        };

                        await User.findOne({ _id: orderData.from }, async (error, userData) => {

                            await admin.messaging().sendToDevice(userData.device_token, message, notification_options)
                                .then(async res => {
                                    console.log('successfully send to device ', userData.device_token);
                                })
                                .catch(err => {
                                    console.log('error :: ', err);
                                })
                        })

                    })
                });
                console.log('user status update error ? ', e2)
                console.log('user status update error ? ', r2)

            });

        })
    }


    async setDeliverStatus(req, res, next) {

        let Order = super.order();
        let User = super.user();

        let { order_id, status, cancelable, picked_up, payload } = req.body;

        await Order.updateOne({ _id: order_id, status: false }, {
            $set: {
                "delivery_status": status,
                "cancelable": cancelable,
                "is_courier_picked_up": picked_up
            }
        }, async (err, resu) => {


            console.log('ERR :: ', err);
            console.log('Result :: ', resu);



            if (Object.keys(resu).length !== 0) {


                await Order.findOne({ _id: order_id }, async (err, orderData) => {

                    let message = {
                        data: {
                            ...payload,
                            subtext: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
                            brg: orderData.barang_yg_dikirim
                        }
                    };

                    await User.findOne({ _id: orderData.from }, async (err, userData) => {

                        await admin.messaging().sendToDevice(userData.device_token, message, notification_options)
                            .then(res => {
                                console.log('success send notif to device : ', userData.device_token);
                            })
                            .catch(err => {
                                console.error('', err);
                            })

                    })

                })
            } else {
                throw new Error(' data kosong ');
            }

        })
    }

    async courierAcceptOrder(req, res) {


        let Order = super.order();
        let User = super.user();

        const { _id } = req.body;

        await Order.updateOne({ _id }, {
            $set: {
                "kurir_accept": true
            }
        }, async (err, re) => {


            await Order.findOne({ _id: _id }, async (err, orderData) => {

                await User.findOne({ _id: orderData.courier }, async (err, courierData) => {

                    let message = {

                        data: {
                            title: "Orderan di Terima Oleh " + courierData.fullname,
                            subtext: moment().tz('Asia/Kuala_Lumpur').format('DD MMMM YYYY HH:mm'),
                            kurir: courierData.fullname,
                            no_hp: courierData.no_hp,
                            type: "KURIR_ACCEPT_ORDER"
                        }
                    };

                    await User.findOne({ _id: orderData.from }, async (err, userData) => {

                        await admin.messaging().sendToDevice(userData.device_token, message, notification_options)
                            .then(res => {
                                console.log('success send notif to device : ', userData.device_token);
                            })
                            .catch(err => {
                                console.error('', err);
                            })
                    })
                })
            })

            return res.json({
                msg: 'success accepted'
            });
        })
    }

    async courierCancelOrder(req, res) {

        let Order = super.order();
        let User = super.user();

        const { _id, token } = req.body;

        await Order.updateOne({ _id }, {
            $set: {
                "kurir_accept": false,
                "courier_cancel": true
            }
        }, async (err, re) => {
            console.log('ERR :: ', err);
            console.log('Result :: ', re);

            await User.updateOne({ token }, {
                $set: {
                    "courier_info.status": false,
                    "active_order": null
                }
            }, (error, result) => {
                return res.json({
                    msg: 'success canceled'
                })
            })
        })
    }
}


export {
    OrderController
}