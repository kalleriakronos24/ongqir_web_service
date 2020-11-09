import mongoose, { Schema } from 'mongoose';
import moment from 'moment';

const BalanceModel = new mongoose.Schema({
    id: String,
    date: String,
    courier_id: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    bukti_transfer: String,
    status : {
        type : Boolean,
        default : false
    },
    reference_id : Number,
    amount : Number,
}, {
    timestamps : true
});

export const BalanceSchema = mongoose.model('balance', BalanceModel);