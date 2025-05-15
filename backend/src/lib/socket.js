import { Server } from "socket.io";
import http from "http";
import express from "express";

const app = express();
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: ["http://localhost:5173"],
  },
});

// export function getReceiverSocketId(userId) {
//   return userSocketMap[userId];
// }

export function getReceiverSocketEmail(Email) {
  return userSocketMap[Email];
}

// used to store online users
const userSocketMap = {}; // {userEmail: Email}

io.on("connection", (socket) => {
  console.log("A user connected", socket.id);

  // const userId = socket.handshake.query.userId;
  // if (userId) userSocketMap[userId] = socket.id;

  const userEmail = socket.handshake.query.userEmail;
  if (userEmail) {
    userSocketMap[userEmail] = socket.id;
  }

  // io.emit() is used to send events to all the connected clients
  io.emit("getOnlineUsers", Object.keys(userSocketMap));

  socket.on("disconnect", () => {
    console.log("A user disconnected", socket.id);
    delete userSocketMap[userEmail];
    io.emit("getOnlineUsers", Object.keys(userSocketMap));
  });
});

export { io, app, server };
