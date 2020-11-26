import mongoose, { Schema } from 'mongoose';


const BankModel = new mongoose.Schema({
    no_rek: String,
    nama_bank: String,
    atas_nama_pemilik: String
}, {
    timestamps: true
})

const BankSchema = mongoose.model('bank', BankModel);

export default BankSchema;
