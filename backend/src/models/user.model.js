// Không cần import poolPromise/poolPromise1 nữa
import { sql as defaultSql } from "../lib/sqlserver.js";

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

export { createUser, getUserByUsername, getUserById };
