import Controller from '../controllers/default.controller';
import { Router } from 'express';

const router =  Router();
class StatisticRoutes extends Controller {


    route() {
        return [
            router.get('/statistic/userthisyear', super.statistic().userStatistic)
        ]
    }
};


export default StatisticRoutes