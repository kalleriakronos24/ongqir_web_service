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

class CourierRoute extends Controller {
    constructor() {
        super()
    }

    route() {
        return [
            router.post('/courier/add', upload.fields([
                {
                    name: 'fotoKtp', maxCount: 1
                },
                {
                    name: 'fotoDiri', maxCount: 1
                }
            ]), super.user().addUser),
            router.get('/courier/single/:token', super.user().getUser)
        ]
    }
}

export default CourierRoute;