// src/routes/friend.route.js

import express from "express";
import { checkFriends, deleteFriend } from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Lấy danh sách bạn bè (gọi hàm checkFriends)
router.get("/:email", checkFriends);

// Xóa bạn bè
router.put("/delete", deleteFriend);
export default router;
