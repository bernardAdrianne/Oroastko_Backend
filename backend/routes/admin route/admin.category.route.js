// USER LOGIN AND REGISTRATION ROUTES

import express from 'express';
import { addCategory, updateCategory, deleteCategory, viewCategories, viewCategory } from '../../controllers/admin/admin.category.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';

const router = express.Router();

// User Authentication and Management
router.get("/viewCategories", verifyAdminRole, viewCategories);
router.get("/viewCategory/:id", verifyAdminRole, viewCategory);
router.post("/addCategory", verifyAdminRole, addCategory);
router.put("/updateCategory/:id", verifyAdminRole, updateCategory);
router.delete("/deleteCategory/:id", verifyAdminRole, deleteCategory);

export default router;