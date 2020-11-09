import Model from '../models/default.model';
import bcrypt from 'bcrypt';
import uniqueString from 'unique-string';
import fs from 'fs';
import geolib from 'geolib';

class CourierController extends Model {

    async getCourier(req, res, next) {

        try {

            const User = super.user();
            const { token } = req.params;

            User.findOne({ token : token }, { fullname : 1, type : 1, token : 1 }, (err, result) => {
                return res.send({
                    msg: 'user data fetched from server',
                    error: false,
                    data: result
                })
            }, (er, reS) => {
                console.log('Result:: ', er);
                console.log('Error:: ', reS);
            })
        } catch (err) {
            throw new Error(err);
        }
    }

}

export default CourierController;