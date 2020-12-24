import Model from '../models/default.model';



class GoogleMapKeyController extends Model {

    async fetchKey(req, res) {
        const Key = super.gmap_key();


        await Key.find({}, (err, data) => {

            return res.json({
                key: data[0].key
            })

        })
    }

    async addKey(req, res) {

        const Key = super.gmap_key();

        const { key } = req.body;

        await Key.create({
            key: key
        }, (e, r) => { });
    }

    async updateKey(req,res) {

        const Key = super.gmap_key();

        const { old_key, new_key } = req.body;

        await Key.updateOne({ key: old_key }, {
            $set: {
                key : new_key
            }
        }, (err,data) => {

            if(err) {
                return;
            }

            return res.json({
                msg : 'updated'
            });
            
        })
    }
};


export default GoogleMapKeyController;