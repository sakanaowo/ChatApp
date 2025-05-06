import express from "express";
import { checkEmail, getAllUsers } from "../controllers/email.controller.js";

const router = express.Router();

// GET /api/email/check/:email
router.get("/check/:email", checkEmail);

// Lấy tất cả người dùng ở các server
router.get("/getAllUsers", getAllUsers);

export default router;
