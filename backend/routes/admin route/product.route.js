// ADMIN PRODUCT ROUTES

import express from 'express';
import { createProduct, deleteProduct, getProducts, getViewProduct, updateProduct,  } from '../../controllers/admin/product.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';

const router = express.Router();

// Admin Product Management
router.get("/products", verifyAdminRole, getProducts);
router.get("/viewProduct/:id", verifyAdminRole, getViewProduct);
router.post("/addproducts", verifyAdminRole, createProduct);
router.put("/editproduct/:id", verifyAdminRole, updateProduct);
router.delete("/deleteproduct/:id", verifyAdminRole, deleteProduct);


export default router;
