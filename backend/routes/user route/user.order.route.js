// USER ORDER ROUTES

import express from 'express';

const router = express.Router();

// User Order
router.post("/orders", placeOrder);
router.get("/orders", getOrders);
router.get("/orders/:id", getDetailsOfOrder);
router.put("/orders/:id/:cancel", cancelOrder);

export default router;