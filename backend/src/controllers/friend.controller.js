import Friend from "../models/friend.model.js";

// Kết bạn (khi chấp nhận lời mời)
const addFriend = async (req, res) => {
    try {
        const userId1 = req.user.id;
        const { userId2 } = req.body;
        console.log("🔥 userId1:", userId1, "userId2:", userId2);
        if (userId1 === userId2) {
            return res.status(400).json({ error: "Bạn không thể kết bạn với chính mình!" });
        }

        await Friend.addFriend(userId1, userId2);
        res.status(201).json({ message: "Đã kết bạn thành công!" });
    } catch (error) {
        console.error("❌ Lỗi trong addFriend:", error.message);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
};

// Lấy danh sách bạn bè
const getFriends = async (req, res) => {
    try {
        const userId = req.user.id;
        const friends = await Friend.getFriendsOfUser(userId);
        res.status(200).json(friends);
    } catch (error) {
        console.error("❌ Lỗi trong getFriends:", error.message);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
};

// Hủy kết bạn
const deleteFriend = async (req, res) => {
    try {
        const userId1 = req.user.id;
        const { userId2 } = req.params;

        await Friend.deleteFriend(userId1, parseInt(userId2));
        res.status(200).json({ message: "Đã hủy kết bạn!" });
    } catch (error) {
        console.error("❌ Lỗi trong deleteFriend:", error.message);
        res.status(500).json({ error: "Lỗi máy chủ!" });
    }
};

export {
    addFriend,
    getFriends,
    deleteFriend,
};
