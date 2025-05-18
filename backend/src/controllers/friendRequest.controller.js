// src/controllers/friendRequest.controller.js

//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import sql from "mssql";
import Email from "../models/email.model.js";
import { getSqlPool } from "../lib/dbSwitcher.js";
import { getReceiverSocketEmail, io } from "../lib/socket.js";

// Hàm phụ: kiểm tra hai người đã là bạn bè chưa
const areFriends = async (email1, email2) => {
    try {
        const pool = await getSqlPool();

        // Lấy server của người nhận (email2)
        const toUser = await Email.findOne({ email: email2 });
        if (!toUser || !toUser.server) {
            throw new Error("Recipient's server not found in MongoDB");
        }

        const server = toUser.server; // ví dụ: 'server3'

        // Truy vấn bảng Friends từ server của người nhận
        const result = await pool.request()
            .input('email1', sql.VarChar, email1)
            .input('email2', sql.VarChar, email2)
            .query(`
                SELECT * FROM [${server}].chatty.dbo.Friends
                WHERE (friend_email1 = @email1 AND friend_email2 = @email2)
                   OR (friend_email1 = @email2 AND friend_email2 = @email1)
            `);

        return result.recordset.length > 0;
    } catch (err) {
        console.error("🔥 Error in areFriends:", err.message);
        throw err;
    }
};

// Hàm gửi lời mời kết bạn (tạm thời bỏ auth bên route để test dễ hơn)
export const sendRequest = async (req, res) => {

    try {
        const fromEmail = req.user.email;
        const { toEmail } = req.body;

        if (!fromEmail || !toEmail) {
            return res.status(400).json({ message: "Both emails are required" });
        }

        // Kiểm tra hai email giống nhau
        if (fromEmail.toLowerCase() === toEmail.toLowerCase()) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        // Lấy thông tin từ MongoDB
        const fromUser = await Email.findOne({ email: fromEmail });
        const toUser = await Email.findOne({ email: toEmail });
        0
        if (!fromUser || !toUser) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        const serverFrom = fromUser.server;
        const serverTo = toUser.server;

        // Kiểm tra xem đã là bạn hay chưa
        const alreadyFriends = await areFriends(fromEmail, toEmail);

        if (alreadyFriends) {
            return res.status(400).json({ message: "Users are already friends" });
        }

        // Kiểm tra xem đã có lời mời kết bạn chưa
        //console.time("CheckRequest");
        const pool = await getSqlPool();
        const request = await pool.request()
            .input("Email1", sql.VarChar, fromEmail)
            .input("Email2", sql.VarChar, toEmail)
            .input("ServerFrom", sql.VarChar, serverFrom)
            .input("ServerTo", sql.VarChar, serverTo)
            .execute("CheckFriendRequestExists");
        //console.timeEnd("CheckRequest");
        if (request.recordset.length > 0) {
            return res.status(400).json({ message: "A pending friend request already exists between these users" });
        }

        // Gọi thủ tục để gửi lời mời kết bạn
        await pool.request()
            .input('SenderEmail', sql.VarChar, fromEmail)
            .input('ReceiverEmail', sql.VarChar, toEmail)
            .input('SourceServer', sql.VarChar, serverFrom)
            .input('TargetServer', sql.VarChar, serverTo)
            .execute('SendFriendRequest');

        // Gửi thông báo đến người nhận qua socket.io
        const receiverSocketId = getReceiverSocketEmail(toEmail);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("receiveFriendRequest", {
                senderEmail: fromEmail,
                receiverEmail: toEmail
            });
        }

        res.status(200).json({ message: "Friend request sent successfully" });
    } catch (error) {
        console.log("Error in sendRequest:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Chấp nhận lời mời kết bạn
export const acceptRequest = async (req, res) => {
    try {
        const receiverEmail = req.user.email; // Lấy từ JWT
        const { senderEmail } = req.body;

        if (!senderEmail) {
            return res.status(400).json({ message: "Sender email is required" });
        }

        // Lấy server 2 người từ MongoDB
        const users = await Email.find({ email: { $in: [senderEmail, receiverEmail] } }).select("email server");

        // if (users.length !== 2) {
        //     return res.status(400).json({ message: "Missing user server info in MongoDB" });
        // }

        const sender = users.find(u => u.email === senderEmail);
        const receiver = users.find(u => u.email === receiverEmail);

        if (!sender || !receiver) {
            return res.status(400).json({ message: "Cannot find sender or receiver server info" });
        }

        const sourceServer = sender.server;
        const targetServer = receiver.server;

        const pool = await getSqlPool(); // server trung tâm

        // Gọi stored procedure xử lý accept
        await pool.request()
            .input("SenderEmail", sql.VarChar, senderEmail)
            .input("ReceiverEmail", sql.VarChar, receiverEmail)
            .input("SourceServer", sql.VarChar, sourceServer)
            .input("TargetServer", sql.VarChar, targetServer)
            .execute("AcceptFriendRequest");

        // Gửi thông báo đến người gửi lời mời qua socket.io
        const senderSocketId = getReceiverSocketEmail(senderEmail);
        if (senderSocketId) {
            io.to(senderSocketId).emit("acceptFriendRequest", {
                senderEmail: receiverEmail,
                receiverEmail: senderEmail
            });
        }

        res.status(200).json({ message: "Friend request accepted successfully" });

    } catch (error) {
        console.error("🔥 Error in acceptRequest:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Từ chối lời mời kết bạn
export const rejectRequest = async (req, res) => {
    try {
        const receiverEmail = req.user.email;
        const { senderEmail } = req.body;

        if (!senderEmail) {
            return res.status(400).json({ message: "Sender email is required" });
        }

        // Tìm server ID của cả hai từ MongoDB
        const users = await Email.find({
            email: { $in: [senderEmail, receiverEmail] }
        }).select("email server");

        if (users.length !== 2) {
            return res.status(400).json({ message: "Cannot find both users in MongoDB" });
        }

        const sender = users.find(u => u.email === senderEmail);
        const receiver = users.find(u => u.email === receiverEmail);

        if (!sender || !receiver) {
            return res.status(400).json({ message: "Could not find users by email" });
        }

        const sourceServer = sender.server;
        const targetServer = receiver.server;

        // Gọi procedure để xóa lời mời trên cả 2 server
        const pool = await getSqlPool(); // Chỉ cần gọi từ 1 server bất kỳ
        await pool.request()
            .input("SenderEmail", sql.VarChar(100), senderEmail)
            .input("ReceiverEmail", sql.VarChar(100), receiverEmail)
            .input("SourceServer", sql.VarChar(100), sourceServer)
            .input("TargetServer", sql.VarChar(100), targetServer)
            .execute("DeleteFriendRequest");

        res.status(200).json({ message: "Friend request rejected successfully" });
    } catch (error) {
        console.error("Error in rejectRequest:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Lấy danh sách lời mời kết bạn chưa xử lý
export const listPendingRequests = async (req, res) => {
    try {
        const email = req.user.email;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // 🔍 Truy MongoDB để lấy server người dùng
        const user = await Email.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found in MongoDB" });
        }

        const serverName = user.server;
        const pool = await getSqlPool(); // luôn dùng 1 pool cố định

        // 🔍 Lấy các lời mời kết bạn mà user này là người nhận
        const result = await pool.request()
            .input("email", sql.VarChar, email)
            .query(`
                SELECT * 
                FROM [${serverName}].chatty.dbo.Friend_requests 
                WHERE Receiver_email = @email AND Status = 'pending'
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error in listPendingRequests:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const listSendedRequests = async (req, res) => {
    try {
        const email = req.user.email;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // 🔍 Truy MongoDB để lấy server người dùng
        const user = await Email.findOne({ email });
        if (!user) {
            return res.status(404).json({ message: "User not found in MongoDB" });
        }

        const serverName = user.server;
        const pool = await getSqlPool(); // luôn dùng 1 pool cố định

        // 🔍 Lấy các lời mời kết bạn mà user này là người gửi
        const result = await pool.request()
            .input("email", sql.VarChar, email)
            .query(`
                SELECT * 
                FROM [${serverName}].chatty.dbo.Friend_requests 
                WHERE Sender_email = @email AND Status = 'pending'
            `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error in listSendedRequests:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
}