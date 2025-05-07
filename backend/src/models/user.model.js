// Không cần import poolPromise/poolPromise1 nữa
import { sql as defaultSql } from "../lib/sqlserver.js";
import Email from "./email.model.js";
import { getSqlPoolByServer } from "../lib/dbSwitcher.js";
import { sql } from "../lib/sqlserver.js";
import { sql1 } from "../lib/sqlserver1.js";
import { sql2 } from "../lib/sqlserver2.js";

// Tạo người dùng mới với pool truyền vào
const createUser = async (username, password, email, pool, sqlInstance = defaultSql) => {
    try {
        const result = await pool.request()
            .input('username', sqlInstance.NVarChar, username)
            .input('password', sqlInstance.VarChar, password)
            .input('email', sqlInstance.VarChar, email)
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
const getUserByUsername = async (username, pool, sqlInstance = defaultSql) => {
    try {
        const result = await pool.request()
            .input('username', sqlInstance.NVarChar, username)
            .query(`SELECT * FROM Users WHERE User_name = @username`);
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
};

// Lấy user theo ID với pool truyền vào
const getUserById = async (userId, pool, sqlInstance = defaultSql) => {
    try {
        const result = await pool.request()
            .input('userId', sqlInstance.Int, userId)
            .query(`SELECT * FROM Users WHERE User_id = @userId`);
        return result.recordset[0];
    } catch (err) {
        throw err;
    }
};


// Lấy người dùng theo email với pool truyền vào
const getUserByEmail = async (email, sqlInstance = defaultSql) => {
    try {
        // 🔹 1. Lấy serverId từ MongoDB
        const emailDoc = await Email.findOne({ email });
        if (!emailDoc || !emailDoc.server) {
            console.error("❌ Email không tồn tại hoặc không có server:", email);
            throw new Error("Email not found or missing server info");
        }

        const serverId = Number(emailDoc.server);
        if (isNaN(serverId)) {
            console.error("❌ serverId không hợp lệ:", serverId);
            throw new Error("Invalid serverId");
        }
        console.log(`✅ Email "${email}" thuộc Server ${serverId}`);

        // 🔹 2. Lấy pool từ serverId
        const pool = await getSqlPoolByServer(serverId);

        // 🟩 Chọn đúng sqlInstance tương ứng
        let sqlInstance;
        switch (serverId) {
            case 1:
                sqlInstance = sql;
                break;
            case 2:
                sqlInstance = sql1;
                break;
            case 3:
                sqlInstance = sql2;
                break;
            default:
                throw new Error("Invalid server ID");
        }

        if (!pool?.request) throw new Error("Invalid pool object");

        const connection = await pool.connect();
        const result = await connection.request()
            .input('email', sqlInstance.VarChar, email)
            .query(`SELECT * FROM Users WHERE Email = @email`);

        if (!result.recordset?.length) throw new Error("User not found");

        return result.recordset[0];
    } catch (err) {
        console.error("🔥 Error in getUserByEmail:", err.message);
        throw err;
    }
};

export { createUser, getUserByUsername, getUserById, getUserByEmail };
