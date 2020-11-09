import Model from '../models/default.model';

class WarungController extends Model {
    async addWarung(req,res){
        const { name } = req.body;
        const WarungModel = super.warung();

        WarungModel.create({
            name
        }, (err,res) => {
            console.log('Err:: ',err);
            console.log('Result:: ', res);
        })

        return res.json({
            result : 'success'
        })
        
    }
}

export default WarungController;