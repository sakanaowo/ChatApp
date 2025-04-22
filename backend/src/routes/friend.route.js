import express from "express";
import { addFriend, getFriends, deleteFriend } from "../controllers/friend.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addFriend); // kết bạn
router.get("/", protectRoute, getFriends); // lấy danh sách bạn
router.delete("/:userId2", protectRoute, deleteFriend); // hủy kết bạn

export default router;
