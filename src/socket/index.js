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

socket.on("callUser", ({ to, signalData, from, callType }) => {
  io.to(to).emit("incomingCall", {
    from,
    signalData,
    callType
  });
});

socket.on("acceptCall", ({ to, signalData }) => {
  io.to(to).emit("callAccepted", { signalData });
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
