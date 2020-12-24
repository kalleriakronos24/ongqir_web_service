import Model from '../models/default.model';
import uniqueString from 'unique-string';
import { isValidObjectId } from 'mongoose'
import isPointWithinRadius from 'geolib/es/isPointWithinRadius';
import findNearest from 'geolib/es/findNearest';
import moment from 'moment';
const socketIo = require('socket.io');

class SocketController extends Model {

    async getCurrentOrderCourier(token) {

        let User = super.user();
        let Order = super.order();

//
        return User.findOne({ token: token, type: 'courier' }, async (error, result) => {
            console.log('is there an error ? :: ', error);
            if (result) {
                console.log('ketemu ?');
                await Order.findOne({ _id: result.active_order, status: false }, (err, resu) => {

                    console.log('ketemu 1 ?');
                    if (resu) {

                        console.log('ketemu 2 ?');
                        return User.findOne({ _id: resu.from }, (e1, r1) => {

                            console.log('ketemu 3?');
                            return User.findOne({ _id: resu.courier }, (e2, r2) => {
                                console.log('nested inside getCurrentOrderCourier working too ????? ');
                                return {
                                    items: resu.item,
                                    courier: r2,
                                    user: r1,
                                    id: resu.order_id,
                                    date: resu.item[0].date,
                                    _id: resu._id,
                                    tipe: resu.tipe
                                }
                            })
                        });
                    } else {

                        console.log('ketemu 3 ?');
                    }
                })

            } else {
                console.log('ada error')
            }
        })

    }
}

export default SocketController;