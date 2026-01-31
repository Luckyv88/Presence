import { Server } from "socket.io";

let io;

export const initSocket = (server) => {
  io = new Server(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.userId = userId;
      socket.join(userId);
      console.log(`User ${userId} joined room`);
    });

    socket.on("callUser", ({ to, from, signalData, callType }) => {
      io.to(to).emit("incomingCall", { from, signalData, callType });
    });

    socket.on("acceptCall", ({ to, signalData }) => {
      io.to(to).emit("callAccepted", { signalData });
    });

    socket.on("endCall", ({ to, from }) => {
      io.to(to).emit("callEnded", { from, to });
    });

    socket.on("leaveCall", ({ userId }) => {
      socket.leave(userId);
      console.log(`User ${userId} left call room`);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });
};

export const getIO = () => io;
