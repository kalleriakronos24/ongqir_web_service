import Controller from '../controllers/default.controller';
import { Router } from 'express';
import multer from 'multer';

const router = Router();

const DIR = "./public/bukti_transfer";
const rand = Math.random() * 999999;

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, DIR);
    },
    filename: (req, file, cb) => {
        const filename = file.originalname
            .toLocaleLowerCase()
            .split(" ")
            .join("-");
        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        if (
            file.mimetype == "image/png" ||
            file.mimetype == "image/jpg" ||
            file.mimetype == "image/jpeg"
        ) {
            cb(null, true);
        } else {
            cb(null, false);
            return cb(new Error("Only .png, .jpg, .jpeg format allowed"));
        }
    }
});

class BalanceRoute extends Controller {
    constructor() {
        super()
    }

    route() {
        return [
            router.post('/request/add/balance', upload.fields([
                {
                    name: 'buktiTransfer', maxCount: 1
                },
            ]), super.balance().requestAddBalance),
            router.get('/all/request/topup/wallet', super.balance().getAllRequestWallet),
            router.post('/accept/request/wallet', super.balance().acceptRequestAddWallet),
            router.get('/all/done/request/topup/wallet', super.balance().getAllDoneRequestWallet),
            router.get('/get/request/add/wallet/:token', super.balance().getUserRequestWallet),
            router.get('/get/user/transaction/done/:token', super.balance().getUserTransactionDone),
            router.post('/reject-request-add-wallet', super.balance().rejectRequestWallet),
            router.get('/get/all/rejected/request', super.balance().getAllRejectedRequestWallet)
        ]
    }
}

export default BalanceRoute;