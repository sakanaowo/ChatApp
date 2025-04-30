import jwt from 'jsonwebtoken';
import { getUserById } from "../models/user.model.js";

export const protectRoute = async (req, res, next) => {
    try {
        const token = req.cookies.jwt;
        console.log('Cookies:', req.cookies);
        console.log(token);
        if (!token) {
            return res.status(401).json({ message: "You need to be logged in" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded Token:', decoded);
        if (!decoded || !decoded.userId) {
            return res.status(401).json({ message: "Invalid token" });
        }

        const user = await getUserById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        req.user = {
            id: user.User_id,
            username: user.User_name,
            email: user.Email,
            profilePic: user.ProfilePic || null,
            serverId: user.Server
        };
        console.log(req.user);
        next();
    } catch (error) {
        console.log("Error in protectRoute middleware:", error.message);
        res.status(500).json({ message: "Internal server error" });
    }
};