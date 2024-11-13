// USER CART ROUTES

import express from 'express';
import { addtoCart, updateItem, deleteItemtoCart, viewCart } from '../../controllers/user/user.cart.controller.js';
import { verifyUserRole } from '../../middleware/verifyUserRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// User Shopping cart
router.post("/addtocart", confirmAuthToken, verifyUserRole, addtoCart);
router.put("/updatecart", confirmAuthToken, verifyUserRole, updateItem);
router.delete("/deletecart", confirmAuthToken, verifyUserRole, deleteItemtoCart);
router.get("/mycart", confirmAuthToken, verifyUserRole, viewCart);

export default router;