import { Router } from 'express'
import Controller from '../controllers/default.controller';
const router = Router();

class OrderRoute extends Controller {
    route() {
        return [
            router.post('/add-order', super.order().addOrder),
            router.post('/find-courier', super.order().getCourier),
            router.post('/user/order/get', super.order().getUserOrder),
            router.post('/user/order/get/all', super.order().getAllOrderByUser),
            router.post('/courier/order/get', super.order().getCurrentOrderCourier),
            router.post('/order/single/set-to-done', super.order().setDoneSingleOrder),
            router.post('/order/courier/get/done/all', super.order().getAllOrderByCourier),
            router.post('/order/courier/set/deliver/status', super.order().setDeliverStatus),
            router.post('/order/set/alasan_user', super.order().setAlasanUser),
            router.post('/order/courier/cancel_order', super.order().setCancelCourierOrder),
            router.post('/courier/accept/order', super.order().courierAcceptOrder),
            router.post('/courier/cancel/order', super.order().courierCancelOrder),
            router.get('/testing', (req, res) => {
                res.redirect(307, "https://github.com/kalleriakronos24/cafely/blob/master/package.json")
            })
        ]
    }
};

export {
    OrderRoute
};