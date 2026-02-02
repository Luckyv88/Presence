import { Server } from "socket.io";

export const initSocket = (httpServer) => {
  const io = new Server(httpServer, {
    cors: {
      origin: [
        "http://localhost:3000",
        "https://presences-5a8n.onrender.com"
      ],
      credentials: true,
    },
  });

  const onlineUsers = new Map(); // userId -> socket.id

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      socket.userId = userId;
      onlineUsers.set(userId, socket.id);
      console.log(`User ${userId} joined room`);

      // Broadcast user online status
      io.emit("updateStatus", { userId, status: "online" });
    });

    socket.on("callUser", ({ to, signalData, from, callType }) => {
      io.to(to).emit("incomingCall", { from, signalData, callType });
      io.emit("updateStatus", { userId: to, status: "ringing" });
    });

    socket.on("acceptCall", ({ to, signalData }) => {
      io.to(to).emit("callAccepted", { signalData });
      io.emit("updateStatus", { userId: to, status: "online" });
    });

    socket.on("endCall", ({ to }) => {
      io.to(to).emit("callEnded");
      io.emit("updateStatus", { userId: to, status: "online" });
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
      const disconnectedUser = [...onlineUsers.entries()].find(([k, v]) => v === socket.id);
      if (disconnectedUser) {
        const [userId] = disconnectedUser;
        onlineUsers.delete(userId);
        io.emit("updateStatus", { userId, status: "offline" });
      }
    });
  });

  return io;
};
