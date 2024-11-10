// USER PRODUCT BROWSING ROUTES

import express from 'express';
import { viewProducts, viewProduct, searchProduct, filterProduct } from '../../controllers/user/product.browsing.js';
import { verifyUserRole } from '../../middleware/verifyUserRole.js';
const router = express.Router();

// User Product Browsing
router.get("/products", verifyUserRole, viewProducts);      
router.get("/view/:productId", verifyUserRole, viewProduct);    
router.get("/searchproduct", verifyUserRole, searchProduct);          
router.get("/filter", verifyUserRole, filterProduct);      

export default router;  