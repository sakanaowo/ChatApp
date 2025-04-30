// utils/dbSwitcher.js
import { poolPromise } from "../lib/sqlserver.js";
import { poolPromise1 } from "../lib/sqlserver1.js";
import { poolPromise2 } from "../lib/sqlserver2.js";

export function getSqlPoolByServer(serverId) {
    switch (serverId) {
        case 1:
            return poolPromise;
        case 2:
            return poolPromise1;
        case 3:
            return poolPromise2;
        default:
            throw new Error("Invalid server ID");
    }
}
