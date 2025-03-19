import express from "express";
import dotenv from "dotenv";
import appRoutes from "./routes/auth.route.js";
import { connectDB } from "./lib/db.js";
dotenv.config();

const PORT = process.env.PORT;

const app = express();

app.use(express.json()); // for parsing application/json

app.use("/api/auth", appRoutes);

app.listen(PORT, () => {
  console.log("Server is running on port:" + PORT);
  connectDB();
});
