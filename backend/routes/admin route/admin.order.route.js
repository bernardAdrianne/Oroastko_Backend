// ADMIN USER MANAGEMENT ROUTES

import express from 'express';
import { getOrders, orderStatus, deleteOrder } from '../../controllers/admin/admin.orders.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// Admin Order Management
router.get("/customerOrders", confirmAuthToken, verifyAdminRole, getOrders);
router.put("/updateOrder/:id/status", confirmAuthToken, verifyAdminRole, orderStatus);
router.delete("/deleteOrder/:id", confirmAuthToken, verifyAdminRole, deleteOrder);

export default router;