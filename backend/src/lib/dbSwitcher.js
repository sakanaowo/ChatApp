// utils/dbSwitcher.js
import { poolPromise } from "../lib/sqlserver.js";
// import { poolPromise1 } from "../lib/sqlserver1.js";
// import { poolPromise2 } from "../lib/sqlserver2.js";

// export async function getSqlPoolByServer(serverId) {
//     switch (serverId) {
//         case "LOCAL1":
//             return poolPromise;
//         case "LOCAL2":
//             return poolPromise1;
//         case "LOCAL3":
//             return poolPromise2;
//         default:
//             throw new Error("Invalid server ID");
//     }
// }

export async function getSqlPool() {
    return poolPromise;
}
