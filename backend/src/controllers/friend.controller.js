// src/controllers/friend.controller.js

//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import sql from "mssql";
import Email from "../models/email.model.js";

// Hàm con: Lấy danh sách bạn bè từ 1 server
const getFriendsFromServer = async (serverId, email) => {
    const pool = await getSqlPoolByServer(serverId);

    const friends1 = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`SELECT friend_email2 AS friendEmail FROM Friends WHERE friend_email1 = @email`);

    const friends2 = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`SELECT friend_email1 AS friendEmail FROM Friends WHERE friend_email2 = @email`);

    return [...friends1.recordset, ...friends2.recordset];
};

// Hàm chính: Lấy tất cả bạn bè từ 3 server
export const checkFriends = async (req, res) => {
    try {
        const email = req.user.email;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let allFriends = [];

        // Giả sử bạn có 3 server (server 1, 2, 3)
        for (let serverId = 1; serverId <= 3; serverId++) {
            const friends = await getFriendsFromServer(serverId, email);
            allFriends = allFriends.concat(friends);
        }

        //Xử lý trùng lặp bạn bè vì thực hiện lấy data 2 lần email1 = email hoặc email2 = email 

        const uniqueFriendsMap = new Map();
        allFriends.forEach(f => {
            uniqueFriendsMap.set(f.friendEmail.toLowerCase(), f);
        });

        const uniqueFriends = Array.from(uniqueFriendsMap.values());

        res.status(200).json(uniqueFriends);

    } catch (error) {
        console.log("Error in checkFriends:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

export const deleteFriend = async (req, res) => {
    try {
        const { email1, email2 } = req.body;

        if (!email1 || !email2) {
            return res.status(400).json({ message: "Both emails are required" });
        }

        if (email1.toLowerCase() === email2.toLowerCase()) {
            return res.status(400).json({ message: "Cannot unfriend yourself" });
        }

        const user1 = await Email.findOne({ email: email1 });
        const user2 = await Email.findOne({ email: email2 });

        if (!user1 || !user2) {
            return res.status(404).json({ message: "User(s) not found" });
        }

        const server1 = Number(user1.server);
        const server2 = Number(user2.server);

        // TH1: Cùng server
        if (server1 === server2) {
            const pool = await getSqlPoolByServer(server1);

            await pool.request()
                .input('email1', sql.VarChar, email1)
                .input('email2', sql.VarChar, email2)
                .query(`
                    DELETE FROM Friends
                    WHERE 
                        (Friend_email1 = @email1 AND Friend_email2 = @email2)
                        OR (Friend_email1 = @email2 AND Friend_email2 = @email1)
                `);
        }
        // TH2: Khác server
        else {
            const pool1 = await getSqlPoolByServer(server1);
            const pool2 = await getSqlPoolByServer(server2);

            await Promise.all([
                pool1.request()
                    .input('email1', sql.VarChar, email1)
                    .input('email2', sql.VarChar, email2)
                    .query(`
                        DELETE FROM Friends
                        WHERE 
                            (Friend_email1 = @email1 AND Friend_email2 = @email2)
                            OR (Friend_email1 = @email2 AND Friend_email2 = @email1)
                    `),
                pool2.request()
                    .input('email1', sql.VarChar, email1)
                    .input('email2', sql.VarChar, email2)
                    .query(`
                        DELETE FROM Friends
                        WHERE 
                            (Friend_email1 = @email1 AND Friend_email2 = @email2)
                            OR (Friend_email1 = @email2 AND Friend_email2 = @email1)
                    `)
            ]);
        }

        res.status(200).json({ message: "Friendship deleted successfully" });
    } catch (error) {
        console.error("Error in deleteFriend:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};
