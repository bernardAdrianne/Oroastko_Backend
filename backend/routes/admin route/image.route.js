// ADMIN IMAGE ROUTES

import express from 'express';
import uploadImage from '../../config/multer.config.js';
import { addImage, getImage, deleteImage } from '../../controllers/admin/image.controller.js';
import { verifyAdminRole } from '../../middleware/verifyAdminRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

// Admin Order Management
router.post("/addImage", confirmAuthToken, verifyAdminRole, uploadImage.single('image'), addImage);
router.get("/getImage", confirmAuthToken, verifyAdminRole, getImage);
router.delete("/deleteImage/:id", confirmAuthToken, verifyAdminRole, deleteImage);

export default router;