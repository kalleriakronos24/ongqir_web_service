import Model from '../models/default.model';



class BankController extends Model {

    async fetchBank(req, res) {

        let Bank = super.bank();

        return await Bank.find({}, async (err, bankData) => {
            if (Object.keys(bankData).length === 0) {
                return;
            }

            else {
                return await res.json({
                    bank: bankData,
                    bank_select: [
                        {
                            value: [...bankData],
                            label: [...bankData]
                        }
                    ]
                })
            }
        })

    }

    async createBank(req, res) {

        let Bank = super.bank();

        const { nama_bank, no_rek, atas_nama_pemilik } = req.body;


        await Bank.create({
            nama_bank,
            no_rek,
            atas_nama_pemilik
        });

        return res.json({

            msg: 'berhasil menambah bank'
        });
    }

};


export default BankController;