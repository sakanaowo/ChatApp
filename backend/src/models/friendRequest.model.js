import { poolPromise, sql } from "../lib/sqlserver.js";


const FriendRequest = {
    createRequest: async (senderId, receiverId) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('SenderId', sql.Int, senderId)
            .input('ReceiverId', sql.Int, receiverId)
            .query(`
        INSERT INTO Friend_requests (Sender_id, Receiver_id)
        VALUES (@SenderId, @ReceiverId)
      `);
        return result.rowsAffected;
    },

    updateStatus: async (requestId, status) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('RequestId', sql.Int, requestId)
            .input('Status', sql.VarChar, status)
            .query(`
        UPDATE Friend_requests SET Status = @Status WHERE Request_id = @RequestId
      `);
        return result.rowsAffected;
    },

    getReceivedRequests: async (userId) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .query(`
        SELECT * FROM Friend_requests WHERE Receiver_id = @UserId
      `);
        return result.recordset;
    },

    // Xóa request
    deleteRequest: async (requestId) => {
        const pool = await poolPromise;
        await pool.request()
            .input('RequestId', sql.Int, requestId)
            .query('DELETE FROM Friend_requests WHERE Request_id = @RequestId');
    },

    // Lấy request theo ID
    getRequestById: async (requestId) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('RequestId', sql.Int, requestId)
            .query('SELECT * FROM Friend_requests WHERE Request_id = @RequestId');
        return result.recordset[0];
    },
};

export { FriendRequest };
