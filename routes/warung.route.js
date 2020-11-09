import { Router } from 'express';
import Controller from '../controllers/default.controller';

const router = Router();

class WarungRoute extends Controller {
    route(){
        return [
            router.post('/add-warung', super.warung().addWarung)
        ]
    }
}

export {
    WarungRoute
};