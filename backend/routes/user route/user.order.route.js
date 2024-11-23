// USER ORDER ROUTES

import express from 'express';
import { placeOrder, myOrders, myOrder } from '../../controllers/user/user.order.controller.js';
import { verifyUserRole } from '../../middleware/verifyUserRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// User Order
router.post("/placeOrder", confirmAuthToken, verifyUserRole, placeOrder);
router.get("/myOrders", confirmAuthToken, verifyUserRole, myOrders);
router.get("/myOrder/:id", confirmAuthToken, verifyUserRole, myOrder);

export default router;