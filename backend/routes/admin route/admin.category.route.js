// ADMIN CATEGORY IMPORTS

import express from 'express';
import { addCategory, updateCategory, deleteCategory, viewCategories, viewCategory } from '../../controllers/admin/admin.category.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// Admin category management routes
router.get("/viewCategories", confirmAuthToken, verifyAdminRole, viewCategories);
router.get("/viewCategory/:id", confirmAuthToken, verifyAdminRole, viewCategory);
router.post("/addCategory", confirmAuthToken, verifyAdminRole, addCategory);
router.put("/updateCategory/:id", confirmAuthToken, verifyAdminRole, updateCategory);
router.delete("/deleteCategory/:id", confirmAuthToken, verifyAdminRole, deleteCategory);

export default router;