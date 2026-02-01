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

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
      socket.userId = userId;
      console.log(`User ${userId} joined room`);
    });

    socket.on("callUser", ({ to, signal, from }) => {
      io.to(to).emit("incomingCall", { from, signal });
    });

    socket.on("acceptCall", ({ to, signal }) => {
      io.to(to).emit("callAccepted", signal);
    });

    socket.on("endCall", ({ to }) => {
      io.to(to).emit("callEnded");
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  return io;
};
