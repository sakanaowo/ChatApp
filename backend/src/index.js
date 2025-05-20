import express from "express";
import dotenv from "dotenv";
dotenv.config();

import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { connectDB } from "./lib/mongodb.js";
import { sql, poolPromise } from "./lib/sqlserver.js";
// import { sql1, poolPromise1 } from "./lib/sqlserver1.js";
// import { sql2, poolPromise2 } from "./lib/sqlserver2.js";

import appRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import emailRoutes from "./routes/email.route.js";
import friendRoutes from "./routes/friend.route.js";
import friendRequestRoutes from "./routes/friendRequest.route.js";
import { app, server } from "./lib/socket.js";

const PORT = process.env.PORT;
const __dirname = path.resolve();

app.use(express.json()); // for parsing application/json
app.use(cookieParser());// allow to parse cookies in middleware
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));// allow to make request from frontend to backend



app.use("/api/auth", appRoutes);
app.use("/api/messages", messageRoutes);
app.use("/api/email", emailRoutes);
app.use("/api/friends", friendRoutes);
app.use("/api/friend-requests", friendRequestRoutes);

if (process.env.NODE_ENV === "production") {
  app.use(express.static(path.join(__dirname, "../frontend/dist")));
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../frontend/dist/index.html"));
  });
}

server.listen(PORT, async () => {
  console.log("Server is running on port:" + PORT);
  connectDB();
});
