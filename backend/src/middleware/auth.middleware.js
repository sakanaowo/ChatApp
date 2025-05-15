import jwt from 'jsonwebtoken';
import { getUserByEmail } from "../models/user.model.js";
import Email from "../models/email.model.js"; // Import model MongoDB
//import { getSqlPoolByServer } from "../lib/dbSwitcher.js"; // Hàm để lấy pool theo server
import { getSqlPool } from "../lib/dbSwitcher.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        // console.log('Cookies:', req.cookies); // In log cookie
        console.log('Cookies:', token); // In log cookie
        if (!token) {
            return res.status(401).json({ message: "You need to be logged in" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded); // In log token sau khi decode
        if (!decoded || !decoded.email) {
            return res.status(401).json({ message: "Invalid token" });
        }

        // ✅ Lấy server từ MongoDB (bảng Email)
        const emailDoc = await Email.findOne({ email: decoded.email });
        if (!emailDoc) {
            return res.status(404).json({ message: "Email not found in MongoDB" });
        }
        const serverId = emailDoc.server;
        console.log(`✅ Email "${decoded.email}" thuộc Server ${serverId}`);

        // Lấy pool kết nối đến SQL Server (dùng pool chung)
        const pool = await getSqlPool();
        console.log(`🔍 Truy vấn User từ SQL Server...`);

        const user = await getUserByEmail(decoded.email, pool);
        console.log('User from DB:', user); // In log user tìm từ DB
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = {
            id: user.User_id,
            username: user.User_name,
            email: user.Email,
            profilePic: user.ProfilePic || null,
            serverId: serverId
        };
        console.log('Authenticated User:', req.user); // In log user đã xác thực
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};
