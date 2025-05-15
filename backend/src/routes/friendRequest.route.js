// src/routes/friendRequest.route.js

import express from "express";
import {
    sendRequest,         // gửi lời mời kết bạn
    listPendingRequests, // lấy danh sách lời mời
    listSendedRequests,  // lấy danh sách lời mời đã gửi
    acceptRequest,       // chấp nhận lời mời
    rejectRequest        // từ chối lời mời
} from "../controllers/friendRequest.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Gửi lời mời kết bạn
router.post("/send", protectRoute, sendRequest);

// Lấy danh sách lời mời kết bạn chưa xử lý
router.get("/pending", protectRoute, listPendingRequests);

// Lấy danh sách lời mời kết bạn đã gửi
router.get("/sended", protectRoute, listSendedRequests);

// Chấp nhận lời mời kết bạn
// để như này để test api dễ hơn
router.put("/accept", protectRoute, acceptRequest);

// Từ chối lời mời kết bạn
router.put("/reject", protectRoute, rejectRequest);

export default router;
