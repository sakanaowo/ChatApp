import { getUserById, getUserByUsername } from "../models/user.model.js";
import Message from "../models/message.model.js";
import cloudinary from "../lib/cloudinary.js";
import { getReceiverSocketEmail, io } from "../lib/socket.js";
import { getSqlPool } from "../lib/dbSwitcher.js";
//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import sql from "mssql";
import Email from "../models/email.model.js";


export const getMessages = async (req, res) => {
    try {
        const senderEmail = req.user.email;
        const receiverEmail = req.params.email;

        if (!senderEmail || !receiverEmail) {
            return res.status(400).json({ message: "Both sender and receiver email are required" });
        }

        const messages = await Message.find({
            $or: [
                { senderEmail: senderEmail, receiverEmail: receiverEmail },
                { senderEmail: receiverEmail, receiverEmail: senderEmail },
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
        const receiverEmail = req.params.email;
        const senderEmail = req.user.email;

        let imageUrl;
        if (image) {
            // Upload base64 image to cloudinary
            const uploadResponse = await cloudinary.uploader.upload(image);
            imageUrl = uploadResponse.secure_url;
        }

        const newMessage = new Message({
            senderEmail,
            receiverEmail,
            text,
            image: imageUrl,
        });

        await newMessage.save();

        //update later
        const receiverSocketId = getReceiverSocketEmail(receiverEmail);
        if (receiverSocketId) {
            io.to(receiverSocketId).emit("newMessage", newMessage);
        }

        res.status(201).json(newMessage);
    } catch (error) {
        console.log("Error in sendMessage controller: ", error.message);
        res.status(500).json({ error: "Internal server error" });
    }
};

