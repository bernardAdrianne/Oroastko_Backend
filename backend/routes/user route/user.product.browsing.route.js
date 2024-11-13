// USER PRODUCT BROWSING ROUTES

import express from 'express';
import { viewProducts, viewProduct, searchProduct, filterProduct } from '../../controllers/user/product.browsing.js';
import { verifyUserRole } from '../../middleware/verifyUserRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// User Product Browsing
router.get("/products", confirmAuthToken, verifyUserRole, viewProducts);      
router.get("/view/:productId", confirmAuthToken, verifyUserRole, viewProduct);    
router.get("/searchproduct", confirmAuthToken, verifyUserRole, searchProduct);          
router.get("/filter", confirmAuthToken, verifyUserRole, filterProduct);      

export default router;  