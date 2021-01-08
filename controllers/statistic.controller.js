import Model from '../models/default.model';

class StatisticController extends Model {


    async userStatistic(req, res) {

        const User = super.user();

        const dateFrom = new Date(2020, 1)
        const dateNow = new Date(2020, 12)

        await User.aggregate([
            {
                $group: {
                    _id: { $substr: ['$createdAt', 5, 2] },
                    bulan: { $sum: 1 }
                }
            }
        ])
        .then(result => {
            return res.json(result)
        })
        .catch(error => {
            return res.json(error);
        })

    }
}


export default StatisticController;