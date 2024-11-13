// ADMIN USER MANAGEMENT ROUTES

import express from 'express';
import { viewUsers, viewUser, deleteUser } from '../../controllers/admin/admin.user.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// Admin User Management
router.get("/users", confirmAuthToken, verifyAdminRole, viewUsers);
router.get("/user/:id", confirmAuthToken, verifyAdminRole, viewUser);
router.delete("/users/:id", confirmAuthToken, verifyAdminRole, deleteUser);

export default router;