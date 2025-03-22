import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import { connectDB } from "./lib/db.js";

import appRoutes from "./routes/auth.route.js";
import messageRoutes from "./routes/message.route.js";




dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json()); // for parsing application/json
app.use(cookieParser());// allow to parse cookies in middleware

app.use("/api/auth", appRoutes);
app.use("/api/message", messageRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
  connectDB();
});
