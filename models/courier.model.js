import mongoose, { Schema } from 'mongoose';


const CourierModel = new mongoose.Schema({
    fullname : {
        required: true,
        maxlength: 24,
        type : String
    },
    email : {
        required: true,
        type : String
    },
    password : {
        required: true,
        type : String
    },
    alamat : {
        required: true,
        type : String
    },
    type : {
        required: true,
        default : 'user',
        type : String
    },
    foto_ktp : String,
    foto_diri : String,
    NIK : String,
    no_hp: {
        type : String,
        default: '08123123123'
    },
    token : String,
    active_order : [{
        type : Schema.Types.ObjectId,
        ref : 'order'
    }],
    history_order : [{
        type : Schema.Types.ObjectId,
        ref : 'order'
    }]
}, {
    timestamps : true
})

const CourierSchema = mongoose.model('courier', CourierModel);

export default CourierSchema;
