import mongoose from 'mongoose';


const Warung = new mongoose.Schema({
    name : String
})

const WarungModel = mongoose.model('warung', Warung);

export default WarungModel;