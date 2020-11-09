import WarungModel from './warung.model';
import UserSchema from './users.model';
import CourierSchema from './courier.model';
import { OrderSchema } from './orders.model';
import { BalanceSchema } from './balance.model';

class Model {
    warung(){
        return WarungModel;
    }
    user(){
        return UserSchema;
    }
    order(){
        return OrderSchema
    }
    balance(){
        return BalanceSchema
    }
}

export default Model;