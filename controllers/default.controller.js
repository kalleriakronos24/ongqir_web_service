/**
 * @description import all controller in your application in here
 */
import WarungController from './warung.controller';
import UserController from './user.controller';
import { OrderController } from './order.controller';
import CourierController from './courier.controller';
import BalanceController from './balance.controller';
import BankController from './bank.controller';


class Controller {
    warung() {
        return new WarungController();
    }
    user() {
        return new UserController();
    }
    order() {
        return new OrderController();
    }
    courier() {
        return new CourierController();
    }
    balance() {
        return new BalanceController();
    }
    bank() {
        return new BankController();
    }
}


export default Controller;