import express from 'express';
import { getNotifs, getNotif, deleteNotif } from '../../controllers/user/user.notification.controller.js';
import { verifyUserRole } from '../../middleware/verifyUserRole.js';
import { confirmAuthToken } from '../../middleware/confirmAuth.js';

const router = express.Router();

router.get("/getNotifs", confirmAuthToken, verifyUserRole, getNotifs);
router.get("/getNotif", confirmAuthToken, verifyUserRole, getNotif);
router.delete("/deleteNotif/:id", confirmAuthToken, verifyUserRole, deleteNotif);

export default router;