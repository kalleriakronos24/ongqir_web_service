import { Router } from 'express';
import Controller from '../controllers/default.controller';

const router = Router();


class GmapRouter extends Controller {

    route() {
        return [
            router.get('/fetch-gmap-key', super.gmap().fetchKey),
            router.post('/add-gmap-key', super.gmap().addKey),
            router.post('/update-gmap-key', super.gmap().updateKey)
        ]
    }
};

export default GmapRouter;