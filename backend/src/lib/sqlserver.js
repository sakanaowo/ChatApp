import dotenv from "dotenv";
dotenv.config();

import sql from "mssql";

const config = {
    user: process.env.SQL_USER,
    password: process.env.SQL_PASSWORD,
    server: process.env.SQL_SERVER || 'localhost',
    port: 1435,
    database: process.env.SQL_DATABASE || 'chatty',
    options: {
        encrypt: false,
        trustServerCertificate: true,
    },
    requestTimeout: 15000,
};

const poolPromise = new sql.ConnectionPool(config)
    .connect()
    .then(pool => {
        console.log(" Kết nối SQL Server thành công!");
        return pool;
    })
    .catch(err => {
        console.error(" Lỗi kết nối SQL Server:", err);
    });

export { sql, poolPromise };