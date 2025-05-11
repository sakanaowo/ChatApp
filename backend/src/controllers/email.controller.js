import Email from "../models/email.model.js";
//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";

// Kiểm tra xem email đã tồn tại chưa
export const checkEmail = async (req, res) => {
    try {
        const { email } = req.params;
        const existingEmail = await Email.findOne({ email });

        if (existingEmail) {
            return res.status(200).json({ exists: true, message: "Email đã tồn tại." });
        }

        return res.status(200).json({ exists: false, message: "Email chưa tồn tại." });
    } catch (error) {
        console.error("Lỗi kiểm tra email:", error.message);
        res.status(500).json({ error: "Lỗi máy chủ" });
    }
};

//Lấy tất cả người dùng ở các server

export const getAllUsers = async (req, res) => {
    try {
        // 1. Lấy toàn bộ email + server từ MongoDB
        const usersMongo = await Email.find({}).select("email server");

        // Gom email theo từng server
        const serverMap = {}; // { 1: [email1, email2], 2: [...], ... }
        for (const user of usersMongo) {
            const sId = Number(user.server);
            if (!serverMap[sId]) serverMap[sId] = [];
            serverMap[sId].push(user.email);
        }

        const allUsers = [];

        // 2. Với mỗi server SQL, truy cập và lấy user tương ứng
        for (const [serverId, emails] of Object.entries(serverMap)) {
            const pool = await getSqlPoolByServer(Number(serverId));

            const emailListStr = emails.map(e => `'${e}'`).join(",");

            const result = await pool.request().query(`
                SELECT User_id, User_name, Email FROM Users
                WHERE Email IN (${emailListStr})
            `);

            // Đính thêm thông tin server vào từng user
            const usersWithServer = result.recordset.map(u => ({
                userId: u.User_id,
                username: u.User_name,
                email: u.Email,
                server: Number(serverId)
            }));

            allUsers.push(...usersWithServer);
        }

        res.status(200).json(allUsers);
    } catch (error) {
        console.error("Error in getAllUsers:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};