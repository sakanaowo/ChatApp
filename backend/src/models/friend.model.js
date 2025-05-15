import { poolPromise, sql } from "../lib/sqlserver.js";

const Friend = {
    // Thêm bạn (dùng khi accept request)
    addFriend: async (userId1, userId2) => {
        const pool = await poolPromise;
        await pool.request()
            .input('User1', sql.Int, userId1)
            .input('User2', sql.Int, userId2)
            .query(`
                    INSERT INTO Friends (Friend_id1, Friend_id2, Added_at)
                    VALUES (@User1, @User2, GETDATE())
                `);
    },

    // Lấy danh sách bạn
    getFriendsOfUser: async (userId) => {
        const pool = await poolPromise;
        const result = await pool.request()
            .input('UserId', sql.Int, userId)
            .query(`
                    SELECT u.User_id, u.User_name, u.Email
                    FROM Friends f
                    JOIN Users u ON 
                        (f.Friend_id1 = @UserId AND u.User_id = f.Friend_id2)
                        OR
                        (f.Friend_id2 = @UserId AND u.User_id = f.Friend_id1)
                `);
        return result.recordset;
    },

    // Hủy kết bạn
    deleteFriend: async (userId1, userId2) => {
        const pool = await poolPromise;
        await pool.request()
            .input('User1', sql.Int, userId1)
            .input('User2', sql.Int, userId2)
            .query(`
                    DELETE FROM Friends
                    WHERE (Friend_id1 = @User1 AND Friend_id2 = @User2)
                       OR (Friend_id1 = @User2 AND Friend_id2 = @User1)
                `);
    }
}

export default Friend;