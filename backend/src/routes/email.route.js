import express from "express";
import { checkEmail } from "../controllers/email.controller.js";

const router = express.Router();

// GET /api/email/check/:email
router.get("/check/:email", checkEmail);

export default router;
