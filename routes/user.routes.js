import Controller from '../controllers/default.controller';
import { Router } from 'express';
import multer from 'multer';

const router = Router();

const DIR = "./public/foto";
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

class UserRoute extends Controller {
    constructor() {
        super()
    }

    route() {
        return [
            router.post('/user/add', upload.fields([
                {
                    name: 'fotoKtp', maxCount: 1
                },
                {
                    name: 'fotoDiri', maxCount: 1
                },
                {
                    name: 'fotoSTNK', maxCount: 1
                }
            ]), super.user().addUser),
            router.post('/user/login', super.user().userLogin),
            router.get('/user/single/:token', super.user().getUser),
            router.post('/user/password/reset', super.user().resetPassword),
            router.get('/user/type/courier', super.user().fetchAllCourier),
            router.post('/courier/update/location', super.user().updateCourierLocation),
            router.post('/courier/logout', super.user().logout),
            router.get('/verif', super.user().verifEmail),
            router.post('/user/resend-verification', super.user().resendVerifEmail),
            router.post('/update-device-token', super.user().updateDeviceToken),
            router.post('/testing123', super.user().testing),
            router.post('/change-password', super.user().changePassword)
        ]
    }
}

export default UserRoute;