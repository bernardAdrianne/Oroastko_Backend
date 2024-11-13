// ADMIN PRODUCT ROUTES

import express from 'express';
import { createProduct, deleteProduct, getProducts, getViewProduct, updateProduct,  } from '../../controllers/admin/product.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// Admin Product Management
router.get("/products", confirmAuthToken, verifyAdminRole, getProducts);
router.get("/viewProduct/:id", confirmAuthToken, verifyAdminRole, getViewProduct);
router.post("/addproducts", confirmAuthToken, verifyAdminRole, createProduct);
router.put("/editproduct/:id", confirmAuthToken, verifyAdminRole, updateProduct);
router.delete("/deleteproduct/:id", confirmAuthToken, verifyAdminRole, deleteProduct);


export default router;
