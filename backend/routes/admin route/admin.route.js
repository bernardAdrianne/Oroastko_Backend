// USER LOGIN AND REGISTRATION ROUTES

import express from 'express';
import { registerAdmin, loginAdmin, logoutAdmin, getAdminProfile, updateAdminProfile, getAdminAnalytics } from '../../controllers/admin/admin.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// User Authentication and Management
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", confirmAuthToken, verifyAdminRole, logoutAdmin);
router.get("/myprofile", confirmAuthToken, verifyAdminRole, getAdminProfile);
router.put("/updateprofile", confirmAuthToken, verifyAdminRole, updateAdminProfile);

// Analytics Route
// router.get('/analytics', confirmAuthToken, verifyAdminRole, getAdminAnalytics);
router.get("/analytics", getAdminAnalytics);

export default router;