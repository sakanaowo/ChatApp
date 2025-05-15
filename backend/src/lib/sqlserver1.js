// import dotenv from "dotenv";
// dotenv.config();

// import sql from "mssql";
// const sql1 = sql; // Export sql for use in other files

// const config = {
//     user: process.env.SQL_USER1,
//     password: process.env.SQL_PASSWORD1,
//     server: process.env.SQL_SERVER1,
//     port: 1436,
//     database: process.env.SQL_DATABASE1,
//     options: {
//         encrypt: false, // Use this if you're on Windows Azure
//         trustServerCertificate: true,
//     },
// };

// const poolPromise1 = new sql.ConnectionPool(config)
//     .connect()
//     .then(pool => {
//         console.log(" Kết nối SQL Server1 thành công!");
//         return pool;
//     })
//     .catch(err => {
//         console.error("Lỗi kết nối SQL Server1:", err);
//     });

// export { sql1, poolPromise1 };