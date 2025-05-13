import express from "express";
import { protectRoute } from "../middleware/auth.middleware.js";
import { getMessages, sendMessage } from "../controllers/message.controller.js";

const router = express.Router();

// router.get("/users", protectRoute, getUsersForSidebar);
// router.get("/:id", protectRoute, getMessages);

// router.post("/send/:id", protectRoute, sendMessage);

router.get("/chat/:email", protectRoute, getMessages);

router.post("/send/:email", protectRoute, sendMessage);

export default router;