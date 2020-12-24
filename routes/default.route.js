/**
 * @description import all route in your application in here
 */
import { HomeRouter } from './home.route'
import { WarungRoute } from './warung.route';
import UserRoute from './user.routes';
import { OrderRoute } from './order.routes';
import BalanceRoute from './balance.route';
import BankRoute from './bank.routes';
import GmapRouter from './gmap.route';

class Route {
    route() {
        return [
            new HomeRouter().route(),
            new WarungRoute().route(),
            new UserRoute().route(),
            new OrderRoute().route(),
            new BalanceRoute().route(),
            new BankRoute().route(),
            new GmapRouter().route()
        ]
    }
}

export {
    Route
}