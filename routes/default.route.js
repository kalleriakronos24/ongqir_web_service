/**
 * @description import all route in your application in here
 */
import { HomeRouter } from './home.route'
import { WarungRoute } from './warung.route';
import UserRoute from './user.routes';
import { OrderRoute } from './order.routes';
import BalanceRoute from './balance.route';
class Route {
    route() {
        return [
            new HomeRouter().route(),
            new WarungRoute().route(),
            new UserRoute().route(),
            new OrderRoute().route(),
            new BalanceRoute().route()
        ]
    }
}

export {
    Route
}