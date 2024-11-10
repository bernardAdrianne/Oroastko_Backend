// ADMIN USER MANAGEMENT ROUTES

import express from 'express';
import { viewUsers, viewUser, deleteUser } from '../../controllers/admin/admin.user.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';

const router = express.Router();

// Admin User Management
router.get("/users", verifyAdminRole, viewUsers);
router.get("/user/:id", verifyAdminRole, viewUser);
router.delete("/users/:id", verifyAdminRole, deleteUser);

export default router;