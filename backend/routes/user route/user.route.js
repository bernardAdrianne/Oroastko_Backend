// USER LOGIN AND REGISTRATION ROUTES

import express from 'express';
import { registerUser, loginUser, logoutUser, getProfile, updateProfile } from '../../controllers/user/user.controller.js';
import { verifyUserRole } from '../../middleware/verifyUserRole.js';

const router = express.Router();

// User Authentication and Management
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", verifyUserRole, logoutUser);
router.get("/myprofile", verifyUserRole, getProfile);
router.put("/updateprofile", verifyUserRole, updateProfile);

export default router;