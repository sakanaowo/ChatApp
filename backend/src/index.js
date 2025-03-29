import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";

import { connectDB } from "./lib/db.js";

import appRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";
import { app, server } from "./lib/socket.js";

dotenv.config();

const PORT = process.env.PORT;

app.use(express.json()); // for parsing application/json
app.use(cookieParser());// allow to parse cookies in middleware
app.use(cors({
  origin: ["http://localhost:5173"],
  credentials: true
}));// allow to make request from frontend to backend

app.use("/api/auth", appRoutes);
app.use("/api/messages", messageRoutes);

server.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
  connectDB();
});
