// Không cần import poolPromise/poolPromise1 nữa
import sql from "mssql";
import Email from "./email.model.js";
//import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import { getSqlPool } from "../lib/dbSwitcher.js";

// Tạo người dùng mới với pool truyền vào
const createUser = async (username, password, email, pool) => {
    try {
        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .input('password', sql.VarChar, password)
            .input('email', sql.VarChar, email)
            .query(`
                INSERT INTO Users (User_name, Password, Email) 
                VALUES (@username, @password, @email)
            `);
        return result;
    } catch (err) {
        throw err;
    }
};

// Lấy người dùng theo username với pool truyền vào
const getUserByUsername = async (username, serverId) => {
    try {
        const allowedServers = ['server1', 'server2', 'server3'];
        if (!allowedServers.includes(serverId)) {
            throw new Error("Invalid server identifier");
        }

        const pool = await getSqlPool(); // pool kết nối với SQL chính (server1)

        const query = `
            SELECT * FROM [${serverId}].chatty.dbo.Users 
            WHERE User_name = @username
        `;

        const result = await pool.request()
            .input('username', sql.NVarChar, username)
            .query(query);

        return result.recordset[0];
    } catch (err) {
        console.error("❌ Error in getUserByUsername:", err.message);
        throw err;
    }
};

// Lấy user theo ID với pool truyền vào
const getUserById = async (userId, pool) => {
    try {
        const result = await pool.request()
            .input('userId', sql.Int, userId)
            .query(`SELECT * FROM Users WHERE User_id = @userId`);
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
};

// Lấy người dùng theo email với pool truyền vào
const getUserByEmail = async (email) => {
    try {
        // 🔹 1. Lấy serverId từ MongoDB
        const emailDoc = await Email.findOne({ email });
        if (!emailDoc || !emailDoc.server) {
            console.error("❌ Email không tồn tại hoặc không có server:", email);
            throw new Error("Email not found or missing server info");
        }

        const serverId = emailDoc.server; // ví dụ: 'server1'
        const pool = await getSqlPool();

        console.log("server: ", serverId);
        const result = await pool.request()
            .input('email', sql.VarChar, email)
            .query(`SELECT * FROM ${serverId}.chatty.dbo.Users WHERE Email = @email`);

        if (!result.recordset?.length) throw new Error("User not found");

        return result.recordset[0];

    } catch (err) {
        console.error("🔥 Error in getUserByEmail:", err.message);
        throw err;
    }
};

export { createUser, getUserByUsername, getUserById, getUserByEmail };
