// ADMIN USER MANAGEMENT ROUTES

import express from 'express';
import { getOrders, viewOrder, orderStatus, deleteOrder } from '../../controllers/admin/admin.orders.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// Admin Order Management
router.get("/customersOrders", confirmAuthToken, verifyAdminRole, getOrders);
router.get("/customerOrder/:id", confirmAuthToken, verifyAdminRole, viewOrder);
router.put("/updateOrder/:id/status", confirmAuthToken, verifyAdminRole, orderStatus);
router.delete("/deleteOrder/:id", confirmAuthToken, verifyAdminRole, deleteOrder);

export default router;