// ADMIN USER MANAGEMENT ROUTES

import express from 'express';

const router = express.Router();

// Admin Order Management
router.get("/orders", getOrders);
router.put("/orders/:id/status", orderStatus);
router.delete("/orders/:id", deleteOrder);

export default router;