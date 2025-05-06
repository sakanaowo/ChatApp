import { getUserById, getUserByUsername } from "../models/user.model.js";
import Message from "../models/message.model.js";

import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketId, io } from "../lib/socket.js";

import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import sql from "mssql";
import Email from "../models/email.model.js";

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

const getUserInfoFromServer = async (serverId, email) => {
    const pool = await getSqlPoolByServer(serverId);

    const result = await pool.request()
        .input('email', sql.VarChar, email)
        .query(`SELECT email, username FROM Users WHERE email = @email`);

    return result.recordset[0] || null;
};

export const getUsersForSidebar = async (req, res) => {
    try {
        const { email } = req.params;
        // const email = req.body;

        if (!email) {
            return res.status(400).json({ message: "Email is required" });
        }

        let allFriends = [];

        // Giả sử bạn có 3 server (server 1, 2, 3)
        for (let serverId = 1; serverId <= 3; serverId++) {
            const friends = await getFriendsFromServer(serverId, email);
            // Gắn serverId vào từng bạn bè
            const friendsWithServerId = friends.map(f => ({
                ...f,
                serverId
            }));

            allFriends = allFriends.concat(friendsWithServerId);
        }

        //Xử lý trùng lặp bạn bè vì thực hiện lấy data 2 lần email1 = email hoặc email2 = email 

        const uniqueFriendsMap = new Map();
        allFriends.forEach(f => {
            uniqueFriendsMap.set(f.friendEmail.toLowerCase(), f);
        });

        const uniqueFriends = Array.from(uniqueFriendsMap.values());

        // Lấy chi tiết từng bạn từ SQL Server tương ứng
        const detailedFriends = await Promise.all(
            uniqueFriends.map(async friend => {
                const userInfo = await getUserInfoFromServer(friend.serverId, friend.friendEmail);
                if (!userInfo) return null;

                return {
                    email: userInfo.email,
                    username: userInfo.username,
                    serverId: friend.serverId
                };
            })
        );

        res.status(200).json(detailedFriends.filter(Boolean));

    } catch (error) {
        console.log("Error in checkFriends:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};

// export const getMessages = async (req, res) => {
//     try {
//         const { id: userToChatId } = req.params;
//         const myId = req.user.id;

//         const messages = await Message.find({
//             $or: [
//                 { senderId: myId, receiverId: userToChatId },
//                 { senderId: userToChatId, receiverId: myId },
//             ],
//         });

//         res.status(200).json(messages);
//     } catch (error) {
//         console.log("Error in getMessages controller: ", error.message);
//         res.status(500).json({ error: "Internal server error" });
//     }
// };


export const getMessages = async (req, res) => {
    try {
        const yourEmail = req.query.myEmail;
        const friendEmail = req.params.email;

        if (!yourEmail || !friendEmail) {
            return res.status(400).json({ message: "Both sender and receiver email are required" });
        }

        const messages = await Message.find({
            $or: [
                { senderEmail: yourEmail, receiverEmail: friendEmail },
                { senderEmail: friendEmail, receiverEmail: yourEmail },
            ],
        }).sort({ createdAt: 1 }); // Optional: sort by time ascending

        res.status(200).json(messages);
    } catch (error) {
        console.log("Error in getMessages controller:", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

export const sendMessage = async (req, res) => {
    try {
        const { text, image } = req.body;
        const { id: receiverId } = req.params;
        const senderId = req.user.id;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderId,
            receiverId,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        const receiverSocketId = getReceiverSocketId(receiverId);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

