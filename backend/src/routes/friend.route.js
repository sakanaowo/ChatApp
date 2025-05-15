// src/routes/friend.route.js

import express from "express";
import { getFriendsForSidebar, deleteFriend } from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Lấy danh sách bạn bè 
router.get("/", protectRoute, getFriendsForSidebar);

// Xóa bạn bè
router.put("/delete", protectRoute, deleteFriend);
export default router;
