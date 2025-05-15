import express from "express";
import { checkEmail, getAllUsers } from "../controllers/email.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// GET /api/email/check/:email
router.get("/check/:email", checkEmail);

// Lấy tất cả người dùng ở các server
// router.get("/getAllUsers", protectRoute, getAllUsers);

router.get("/getAllUsers", protectRoute, getAllUsers);

export default router;
