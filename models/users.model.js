/**
 * Module Imports
 */

import mongoose, { Schema } from 'mongoose';

const Users = new mongoose.Schema({
    fullname: {
        required: true,
        maxlength: 24,
        type: String
    },
    email: {
        required: true,
        type: String
    },
    password: {
        required: true,
        type: String
    },
    alamat: {
        type: String,
        default: ""
    },
    type: {
        required: true,
        default: 'user',
        type: String
    },
    foto_ktp: String,
    foto_diri: String,
    foto_stnk: String,
    NIK: String,
    no_hp: String,
    token: String,
    active_order: {
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    history_order: [{
        type: Schema.Types.ObjectId,
        ref: 'order'
    }],
    courier_info: {
        status: Boolean,
        coords: {
            latitude: Number,
            longitude: Number
        },
        balance: Number
    },
    user_info: {
        balance: Number
    },
    user_order: {
        type: Schema.Types.ObjectId,
        ref: 'order'
    },
    user_history_order: [],
    suspended: false,
    online: {
        type: Boolean,
        default: false
    },
    socket_id: String,
    account_created: String,
    verified: {
        type: Boolean,
        default: false
    },
    verif_code: Number,
    canceled_from: String,
    device_token : String
}, {
    timestamps: true
})

const UserSchema = mongoose.model('User', Users);

export default UserSchema;