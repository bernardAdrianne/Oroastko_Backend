// USER CART ROUTES

import express from 'express';
import { addtoCart, updateItem, deleteItemtoCart, viewCart } from '../../controllers/user/user.cart.controller.js';
import { verifyUserRole } from '../../middleware/verifyUserRole.js';

const router = express.Router();

// User Shopping cart
router.post("/addtocart", verifyUserRole, addtoCart);
router.put("/updatecart", verifyUserRole, updateItem);
router.delete("/deletecart", verifyUserRole, deleteItemtoCart);
router.get("/mycart", verifyUserRole, viewCart);

export default router;