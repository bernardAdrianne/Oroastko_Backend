// USER LOGIN AND REGISTRATION ROUTES

import express from 'express';
import { registerAdmin, loginAdmin, logoutAdmin, getAdminProfile, updateAdminProfile } from '../../controllers/admin/admin.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';

const router = express.Router();

// User Authentication and Management
router.post("/register", registerAdmin);
router.post("/login", loginAdmin);
router.post("/logout", verifyAdminRole, logoutAdmin);
router.get("/myprofile", verifyAdminRole, getAdminProfile);
router.put("/updateprofile", verifyAdminRole, updateAdminProfile);

export default router;