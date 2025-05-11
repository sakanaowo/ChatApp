// src/controllers/friend.controller.js

//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import sql from "mssql";
import Email from "../models/email.model.js";
import { getSqlPool } from "../lib/dbSwitcher.js";

export const getFriendsForSidebar = async (req, res) => {
    try {
        const email = req.user.email;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        // Truy vấn MongoDB để tìm server người dùng
        const userDoc = await Email.findOne({ email });
        if (!userDoc || !userDoc.server) {
            return res.status(404).json({ message: "User not found or missing server info in MongoDB" });
        }

        const sourceServer = userDoc.server; // Ex: "LOCAL1", "LOCAL2", ...

        const pool = await getSqlPool(); // server trung tâm (server1)

        // Gọi procedure để lấy danh sách bạn bè
        const result = await pool.request()
            .input("Email", sql.VarChar(100), email)
            .input("SourceServer", sql.VarChar(100), sourceServer)
            .execute("sp_GetAllFriendsByEmail");

        const rawFriends = result.recordset;

        // Lấy danh sách email bạn bè
        const friendEmails = rawFriends.map(f => f.Email);

        // Truy vấn MongoDB để lấy serverId từng người bạn
        const friendDocs = await Email.find({ email: { $in: friendEmails } }).select("email server");

        // Kết hợp dữ liệu
        const friends = rawFriends.map(friend => {
            const doc = friendDocs.find(d => d.email === friend.Email);
            return {
                email: friend.Email,
                username: friend.User_name,
                addedAt: friend.Added_at,
                serverId: doc ? doc.server : null
            };
        });

        res.status(200).json(friends);

    } catch (error) {
        console.error("Error in getUsersForSidebar:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteFriend = async (req, res) => {
    try {
        const email1 = req.user.email;
        const { email2 } = req.body;

        if (!email1 || !email2) {
            return res.status(400).json({ message: "Both emails are required" });
        }

        if (email1.toLowerCase() === email2.toLowerCase()) {
            return res.status(400).json({ message: "Cannot unfriend yourself" });
        }

        // Truy vấn MongoDB để lấy server của 2 người
        const users = await Email.find({ email: { $in: [email1, email2] } }).select("email server");

        if (users.length !== 2) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        const user1 = users.find(u => u.email === email1);
        const user2 = users.find(u => u.email === email2);

        if (!user1 || !user2) {
            return res.status(404).json({ message: "User server info missing" });
        }

        const sourceServer = user1.server;
        const targetServer = user2.server;

        const pool = await getSqlPool(); // Pool đến server trung tâm

        // Gọi stored procedure DeleteFriend
        await pool.request()
            .input('Email1', sql.VarChar, email1)
            .input('Email2', sql.VarChar, email2)
            .input('SourceServer', sql.VarChar, sourceServer)
            .input('TargetServer', sql.VarChar, targetServer)
            .execute('DeleteFriend');

        res.status(200).json({ message: "Friendship deleted successfully" });
    } catch (error) {
        console.error("❌ Error in deleteFriend:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};