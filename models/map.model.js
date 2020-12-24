import mongoose from 'mongoose';


const MapKey = new mongoose.Schema({
    key : String
});

const MapKeySchema = mongoose.model('google_map_key', MapKey);

export default MapKeySchema;