// src/controllers/friendRequest.controller.js

import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import sql from "mssql";
import Email from "../models/email.model.js";

// Hàm phụ: kiểm tra hai người đã là bạn bè chưa
const areFriends = async (serverId, email1, email2) => {

    const pool = await getSqlPoolByServer(serverId);

    console.log("Pool in areFriends for server:", serverId, pool);
    const result = await pool.request()
        .input('email1', sql.VarChar, email1)
        .input('email2', sql.VarChar, email2)
        .query(`
      SELECT * FROM Friends
      WHERE (friend_email1 = @email1 AND friend_email2 = @email2)
         OR (friend_email1 = @email2 AND friend_email2 = @email1)
    `);

    return result.recordset.length > 0;
};

// Hàm gửi lời mời kết bạn (tạm thời bỏ auth bên route để test dễ hơn)
export const sendRequest = async (req, res) => {
    try {
        const fromEmail = req.user.email;
        const { toEmail } = req.body;

        if (!fromEmail || !toEmail) {
            return res.status(400).json({ message: "Both emails are required" });
        }

        //check 2 email giống
        if (fromEmail.toLowerCase() === toEmail.toLowerCase()) {
            return res.status(400).json({ message: "You cannot send a friend request to yourself" });
        }

        //Lấy email trên mongoDB
        const fromUser = await Email.findOne({ email: fromEmail });
        const toUser = await Email.findOne({ email: toEmail });

        if (!fromUser || !toUser) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        const serverFrom = Number(fromUser.server);
        const serverTo = Number(toUser.server);

        // Check đã là bạn chưa
        const alreadyFriends = await areFriends(serverFrom, fromEmail, toEmail)
            || await areFriends(serverTo, fromEmail, toEmail);

        if (alreadyFriends) {
            return res.status(400).json({ message: "Users are already friends" });
        }

        // Hàm phụ để kiểm tra đã tồn tại lời mời chưa
        const requestExists = async (pool, email1, email2) => {
            const result = await pool.request()
                .input('email1', sql.VarChar, email1)
                .input('email2', sql.VarChar, email2)
                .query(`
                    SELECT * FROM Friend_requests 
                    WHERE 
                        (Sender_email = @email1 AND Receiver_email = @email2 AND Status = 'pending')
                     OR (Sender_email = @email2 AND Receiver_email = @email1 AND Status = 'pending')
                `);
            return result.recordset.length > 0;
        };

        // TH1: Cùng server
        if (serverFrom === serverTo) {
            const pool = await getSqlPoolByServer(serverFrom);

            console.log("Pool (same server):", pool);

            const exists = await requestExists(pool, fromEmail, toEmail);
            if (exists) {
                return res.status(400).json({ message: "Friend request already sent" });
            }

            await pool.request()
                .input('senderEmail', sql.VarChar, fromEmail)
                .input('receiverEmail', sql.VarChar, toEmail)
                .query(`INSERT INTO Friend_requests (Sender_email, Receiver_email) VALUES (@senderEmail, @receiverEmail)`);
        }
        // TH2: Khác server
        else {
            const poolFrom = await getSqlPoolByServer(serverFrom);
            const poolTo = await getSqlPoolByServer(serverTo);

            console.log("Pool From (server", serverFrom, "):", poolFrom);
            console.log("Pool To (server", serverTo, "):", poolTo);

            const existsFrom = await requestExists(poolFrom, fromEmail, toEmail);
            const existsTo = await requestExists(poolTo, fromEmail, toEmail);

            if (existsFrom || existsTo) {
                return res.status(400).json({ message: "Friend request already sent" });
            }

            console.log("Inserting into poolFrom...");
            await poolFrom.request()
                .input('senderEmail', sql.VarChar, fromEmail)
                .input('receiverEmail', sql.VarChar, toEmail)
                .query(`INSERT INTO Friend_requests (Sender_email, Receiver_email) VALUES (@senderEmail, @receiverEmail)`);
            console.log("Inserted into poolFrom");

            console.log("Inserting into poolTo...");
            await poolTo.request()
                .input('senderEmail', sql.VarChar, fromEmail)
                .input('receiverEmail', sql.VarChar, toEmail)
                .query(`INSERT INTO Friend_requests (Sender_email, Receiver_email) VALUES (@senderEmail, @receiverEmail)`);
            console.log("Inserted into poolTo");

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
        //let { serverId, requestId } = req.body;

        const userEmail = req.user.email; // ✅ Email người nhận (Receiver_email)
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({ message: "Server ID are required" });
        }

        // 🔍 Truy MongoDB để lấy serverId người nhận
        const receiverDoc = await Email.findOne({ email: userEmail });
        if (!receiverDoc) {
            return res.status(404).json({ message: "Receiver not found in MongoDB" });
        }

        const serverId = Number(receiverDoc.server);
        const pool = await getSqlPoolByServer(serverId);

        // 1. Lấy thông tin lời mời
        const requestResult = await pool.request()
            .input("requestId", sql.Int, requestId)
            .query(`SELECT * FROM Friend_requests WHERE Request_id = @requestId`);

        const request = requestResult.recordset[0];

        if (!request) {
            return res.status(404).json({ message: "Friend request not found or already handled" });
        }

        const { Sender_email, Receiver_email } = request;

        // 2. Lấy thông tin user từ MongoDB
        const users = await Email.find({
            email: { $in: [Sender_email, Receiver_email] }
        }).select("email userid server");

        console.log(Sender_email, Receiver_email);
        if (users.length !== 2) {
            return res.status(400).json({ message: "User info missing in MongoDB" });
        }

        const sender = users.find(u => u.email === Sender_email);
        const receiver = users.find(u => u.email === Receiver_email);

        if (!sender || !receiver) {
            return res.status(400).json({ message: "Could not find users by email" });
        }

        const serverSender = Number(sender.server);
        const serverReceiver = Number(receiver.server);

        // 3. Insert bạn (Thay userId bằng email)
        if (serverSender === serverReceiver) {
            // Cùng server
            const poolSame = await getSqlPoolByServer(serverSender);
            await poolSame.request()
                .input("senderEmail", sql.VarChar, Sender_email)
                .input("receiverEmail", sql.VarChar, Receiver_email)
                .query(`INSERT INTO Friends (Friend_email1, Friend_email2) VALUES (@senderEmail, @receiverEmail)`);
        } else {
            // Khác server
            const poolSender = await getSqlPoolByServer(serverSender);
            const poolReceiver = await getSqlPoolByServer(serverReceiver);

            // Lưu ở server sender
            await poolSender.request()
                .input("senderEmail", sql.VarChar, Sender_email)
                .input("receiverEmail", sql.VarChar, Receiver_email)
                .query(`INSERT INTO Friends (Friend_email1, Friend_email2) VALUES (@senderEmail, @receiverEmail)`);

            // Lưu ở server receiver
            await poolReceiver.request()
                .input("senderEmail", sql.VarChar, Sender_email)
                .input("receiverEmail", sql.VarChar, Receiver_email)
                .query(`INSERT INTO Friends (Friend_email1, Friend_email2) VALUES (@senderEmail, @receiverEmail)`);
        }

        // 4. Xóa lời mời kết bạn
        await pool.request()
            .input("requestId", sql.Int, requestId)
            .query(`DELETE FROM Friend_requests WHERE Request_id = @requestId`);

        // Nếu khác server thì xóa thêm ở server sender
        if (serverSender !== serverReceiver) {
            const poolSender = await getSqlPoolByServer(serverSender);
            await poolSender.request()
                .input("senderEmail", sql.VarChar, Sender_email)
                .input("receiverEmail", sql.VarChar, Receiver_email)
                .query(`DELETE FROM Friend_requests WHERE Sender_email = @senderEmail AND Receiver_email = @receiverEmail`);
        }

        res.status(200).json({ message: "Friend request accepted successfully" });
    } catch (error) {
        console.error("Error in acceptRequest:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// Từ chối lời mời kết bạn
export const rejectRequest = async (req, res) => {
    try {
        const userEmail = req.user.email; // ✅ Lấy email người nhận từ req.user (đã xác thực)
        const { requestId } = req.body;

        if (!requestId) {
            return res.status(400).json({ message: "Request ID is required" });
        }

        // 🔍 Truy MongoDB để lấy serverId người nhận
        const receiverDoc = await Email.findOne({ email: userEmail });
        if (!receiverDoc) {
            return res.status(404).json({ message: "Receiver not found in MongoDB" });
        }

        const serverId = Number(receiverDoc.server);
        const pool = await getSqlPoolByServer(serverId);

        // 1. Lấy thông tin lời mời
        const requestResult = await pool.request()
            .input("requestId", sql.Int, requestId)
            .query(`SELECT * FROM Friend_requests WHERE Request_id = @requestId`);

        const request = requestResult.recordset[0];

        if (!request) {
            return res.status(404).json({ message: "Friend request not found" });
        }

        const { Sender_email, Receiver_email } = request;

        // 2. Lấy thông tin user
        const users = await Email.find({
            email: { $in: [Sender_email, Receiver_email] }
        }).select("email server");

        if (users.length !== 2) {
            return res.status(400).json({ message: "User info missing in MongoDB" });
        }

        const sender = users.find(u => u.email === Sender_email);
        const receiver = users.find(u => u.email === Receiver_email);

        if (!sender || !receiver) {
            return res.status(400).json({ message: "Could not find users by email" });
        }

        const serverSender = Number(sender.server);
        const serverReceiver = Number(receiver.server);

        // 3. Xóa ở server receiver (người nhận)
        await pool.request()
            .input("senderEmail", sql.VarChar, Sender_email)
            .input("receiverEmail", sql.VarChar, Receiver_email)
            .query(`DELETE FROM Friend_requests WHERE Sender_email = @senderEmail AND Receiver_email = @receiverEmail`);

        // 4. Nếu khác server, xóa ở server sender
        if (serverSender !== serverReceiver) {
            const poolSender = await getSqlPoolByServer(serverSender);
            await poolSender.request()
                .input("senderEmail", sql.VarChar, Sender_email)
                .input("receiverEmail", sql.VarChar, Receiver_email)
                .query(`DELETE FROM Friend_requests WHERE Sender_email = @senderEmail AND Receiver_email = @receiverEmail`);
        }

        res.status(200).json({ message: "Friend request rejected successfully" });
    } catch (error) {
        console.log("Error in rejectRequest:", error.message);
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

        // 🔍 Truy vấn MongoDB để lấy serverId dựa vào email
        const user = await Email.findOne({ email: email }); // Model MongoDB lưu email & serverId
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        const serverId = Number(user.server); // Lấy serverId đã lưu trong MongoDB

        // 🔌 Kết nối SQL theo serverId của user
        const pool = await getSqlPoolByServer(serverId);

        // 🔍 Truy vấn SQL để lấy lời mời kết bạn chưa xử lý
        const result = await pool.request()
            .input("email", sql.VarChar, email)
            .query(`SELECT * FROM Friend_requests WHERE Receiver_email = @email`);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.log("Error in listPendingRequests:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};