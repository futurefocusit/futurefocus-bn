import { Router } from "express";
import { PaymentController } from "../controllers/paymentControllers"
export const paymentRouter = Router()
paymentRouter.get('/',PaymentController.payment)
paymentRouter.delete('/:id',PaymentController.deletePayment)
paymentRouter.get('/transaction',PaymentController.getTansactions)
paymentRouter.delete('/transaction/:id',PaymentController.deleteTransaction)
paymentRouter.post('/pay/:id',PaymentController.SchoolFees)
paymentRouter.post('/recover/:studentId',PaymentController.recoverPayment)
paymentRouter.put('/discount/:id',PaymentController.addDiscount)
paymentRouter.put("/comment/:id", PaymentController.AddComment);
paymentRouter.put("/extra/:id", PaymentController.addExtra);