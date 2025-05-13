import Email from "../models/email.model.js";
//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import { getSqlPool } from "../lib/dbSwitcher.js";

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
        const pool = await getSqlPool();

        // Gộp toàn bộ user từ 3 server bằng UNION ALL
        const result = await pool.request().query(`
      SELECT User_id, User_name, Email, 'server1' AS server FROM [server1].chatty.dbo.Users
      UNION ALL
      SELECT User_id, User_name, Email, 'server2' AS server FROM [server2].chatty.dbo.Users
      UNION ALL
      SELECT User_id, User_name, Email, 'server3' AS server FROM [server3].chatty.dbo.Users
    `);

        res.status(200).json(result.recordset);
    } catch (error) {
        console.error("Error in getAllUsers:", error.message);
        res.status(500).json({ message: "Internal Server Error" });
    }
};