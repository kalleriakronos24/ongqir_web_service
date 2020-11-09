import mongoose, { Schema } from 'mongoose';

const OrderModel = new mongoose.Schema({
    order_id: String,
    from: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    courier: {
        type: Schema.Types.ObjectId,
        ref: 'user'
    },
    penerima: Object,
    status: {
        type: Boolean,
        default: false
    },
    tipe: {
        type: String,
        default: 'antar'
    },
    pengirim: Object,
    order_date: String,
    delivery_status: {
        type: String,
        default: "belum di ambil"
    },
    is_courier_picked_up: {
        type: Boolean,
        default: false
    },
    user_cancel: {
        type : Boolean,
        default: false
    },
    alasan_user: {
        type : String,
        default : ""
    },
    courier_cancel: {
        type : Boolean,
        default: false
    },
    cancelable: {
        type: Boolean,
        default: true
    },
    ongkir : Number,
    barang_yg_dikirim : String,
    distance : Number,
    kurir_accept: {
        type : Boolean,
        default: false
    },
    waktu_barang_terkirim : String
}, {
    timestamps : true
});

export const OrderSchema = mongoose.model('order', OrderModel);
