// src/routes/friendRequest.route.js

import express from "express";
import {
    sendRequest,         // gửi lời mời kết bạn
    listPendingRequests, // lấy danh sách lời mời
    acceptRequest,       // chấp nhận lời mời
    rejectRequest        // từ chối lời mời
} from "../controllers/friendRequest.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Gửi lời mời kết bạn
router.post("/", sendRequest);

// Lấy danh sách lời mời kết bạn chưa xử lý
router.get("/", listPendingRequests);

// Chấp nhận lời mời kết bạn
// để như này để test api dễ hơn
router.put("/accept", acceptRequest);

// Từ chối lời mời kết bạn
router.put("/reject", rejectRequest);

export default router;
