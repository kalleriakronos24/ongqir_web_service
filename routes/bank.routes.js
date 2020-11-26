import Controller from '../controllers/default.controller';
import { Router } from 'express';




class BankRoute extends Controller {
    constructor() {
        super()
    };

    route() {
        const router = Router();
        return [
            router.post('/add-bank', super.bank().createBank),
            router.get('/fetch-bank', super.bank().fetchBank)
        ]
    }
}

export default BankRoute;