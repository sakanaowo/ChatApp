import express from "express";
import {
    sendFriendRequest,
    getFriendRequests,
    respondToRequest,
    deleteFriendRequest
} from "../controllers/friendRequest.controller.js";
import { protectRoute } from "../middleware/auth.middleware.js";

const router = express.Router();

// Mọi route đều cần xác thực
router.post("/", protectRoute, sendFriendRequest);
router.get("/", protectRoute, getFriendRequests);
router.put("/:requestId", protectRoute, respondToRequest);
router.delete("/:requestId", protectRoute, deleteFriendRequest);

export default router;
