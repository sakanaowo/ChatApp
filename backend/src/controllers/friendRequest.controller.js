import { FriendRequest } from "../models/friendRequest.model.js";
import Friend from "../models/friend.model.js";


// Gửi lời mời kết bạn
export const sendFriendRequest = async (req, res) => {
    try {
        const senderId = req.user.id;
        const { receiverId } = req.body;

        console.log('Sender ID:', senderId, '| Receiver ID:', receiverId);
        if (senderId === receiverId) {
            return res.status(400).json({ error: "You can't send request to yourself" });
        }

        const result = await FriendRequest.createRequest(senderId, receiverId);
        res.status(201).json({ message: "Friend request sent!", rowsAffected: result });
    } catch (error) {
        console.error("Error in sendFriendRequest:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Lấy danh sách lời mời kết bạn nhận được
export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await FriendRequest.getReceivedRequests(userId);
        res.status(200).json(requests);
    } catch (error) {
        console.error("Error in getFriendRequests:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Chấp nhận hoặc từ chối lời mời
export const respondToRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const { status } = req.body; // "accepted" hoặc "declined"

        console.log("➡️ requestId:", requestId, "| status:", status);

        const request = await FriendRequest.getRequestById(requestId);
        console.log("📦 request:", request);
        if (!["accepted", "declined"].includes(status)) {
            return res.status(400).json({ error: "Invalid status" });
        }

        // Cập nhật trạng thái lời mời
        const result = await FriendRequest.updateStatus(requestId, status);

        // Nếu chấp nhận -> thêm bạn vào bảng friends
        if (status === "accepted") {
            const request = await FriendRequest.getRequestById(requestId);
            const { Sender_id, Receiver_id } = request;

            await Friend.addFriend(Sender_id, Receiver_id); // Gọi hàm tạo bạn bè
        }

        res.status(200).json({ message: `Friend request ${status}`, rowsAffected: result });
    } catch (error) {
        console.error("Error in respondToRequest:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

// Xóa lời mời
export const deleteFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        await FriendRequest.deleteRequest(requestId);
        res.status(200).json({ message: "Friend request deleted" });
    } catch (error) {
        console.error("Error in deleteFriendRequest:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};
