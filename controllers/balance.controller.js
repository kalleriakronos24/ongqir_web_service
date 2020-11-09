import Model from '../models/default.model';
import moment from 'moment';

class BalanceController extends Model {


    async requestAddBalance(req, res) {

        let Balance = super.balance();
        let User = super.user();


        let { token, ref } = req.body;

        const uri = req.protocol + '://' + req.get('host');
        console.log('current URL ', req.body);

        const fotoBuktiTransfer = req.files ? `${uri}/public/bukti_transfer/${req.files['buktiTransfer'][0].filename}` : null;

        return await User.findOne({ token: token }, async (err, data) => {
            if (Object.keys(data).length === 0) {
                return res.json({
                    error: true
                })
            } else {
                return await Balance.create({
                    id: moment().locale('id-ID').format('DD/MM/YY') + '/' + Math.round(Math.random() * 9999),
                    date: moment().locale('id-ID').format('DD/MM/YY HH:MM'),
                    bukti_transfer: fotoBuktiTransfer || null,
                    courier_id: data._id,
                    reference_id: ref,
                })
                    .then(result => {
                        console.log('request add balance added :: ', result);
                        return res.json({
                            error: false,
                            msg: 'request to add wallet successfully'
                        })
                    })
                    .catch(error => {
                        return res.json({
                            error: true,
                            msg: 'request to add wallet failed'
                        })
                    })
            }
        })
    }

    async getAllRequestWallet(req, res) {

        let Balance = super.balance();

        return Balance.find({ status: false })
            .populate('courier_id')
            .exec((err, result) => {
                console.log('error ? ::', err);
                if (result.length === 0)
                    return res.json([])
                return res.json(result);
            })
    }

    async getUserRequestWallet(req, res) {

        let Balance = super.balance();
        let User = super.user();

        const { token } = req.params;

        return User.findOne({ token }, (err, data) => {

            if (data !== null || Object.keys(data).length !== 0) {

                Balance.find({ status: false, courier_id: data._id })
                    .populate('courier_id')
                    .exec((err, result) => {
                        console.log('error ? ::', err);
                        if (result.length === 0)
                            return res.json({
                                data: [],
                                wallet: data.courier_info.balance
                            })
                        return res.json({
                            data: result,
                            wallet: data.courier_info.balance
                        });
                    })
            } else {
                return res.json({
                    error: true
                });
            }
        })
    }

    async getUserTransactionDone(req, res) {

        let Balance = super.balance();
        let User = super.user();

        const { token } = req.params;

        return User.findOne({ token }, (err, data) => {

            if (data !== null || Object.keys(data).length !== 0) {

                Balance.find({ status: true, courier_id: data._id })
                    .populate('courier_id')
                    .exec((err, result) => {
                        console.log('error ? ::', err);
                        if (result.length === 0)
                            return res.json({
                                data: [],
                                wallet: data.courier_info.balance
                            })
                        return res.json({
                            data: result,
                            wallet: data.courier_info.balance
                        });
                    })
            } else {
                return res.json({
                    error: true
                });
            }
        })
    }

    async getAllDoneRequestWallet(req, res) {

        let Balance = super.balance();

        return Balance.find({ status: true })
            .populate('courier_id')
            .exec((err, result) => {
                console.log('error ? ::', err);
                if (result.length === 0)
                    return res.json([])
                return res.json(result);
            })
    }

    async acceptRequestAddWallet(req, res) {

        let Balance = super.balance();
        let User = super.user();

        let { id, wallet } = req.body;
        let walleto = Number(wallet);

        console.log('req body :: ', req.body);


        await Balance.findOne({ _id: id }, (err, data) => {

            if (data !== null || Object.keys(data).length !== 0) {

                Balance.updateOne({ _id: data._id }, {
                    $set: {
                        "status": true,
                        "amount": walleto
                    }
                }, async (er, re) => {
                    console.log('err updating status :: ', er);
                    console.log('berhasil mengupdate status :: ', re);

                    await User.findOne({ _id: data.courier_id }, {}, async (error, data1) => {

                        if (Object.keys(data1).length !== 0 || data1 !== null) {

                            await User.updateOne({ _id: data.courier_id }, {
                                $set: {
                                    "courier_info.balance": data1.courier_info.balance + walleto
                                }
                            }, (er1, re1) => {
                                console.log('err updating wallet :: ', er1);
                                console.log('berhasil mengupdate courier wallet :: ', re1);
                                return res.json({
                                    msg: 'success'
                                });
                            })
                        }
                    })
                })
            }
        })
    }
}

export default BalanceController;