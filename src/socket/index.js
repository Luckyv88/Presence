const userSocketMap = new Map();

io.on("connection", (socket) => {

  socket.on("join", (userId) => {
    userSocketMap.set(userId, socket.id);
    socket.join(userId); // 🔥 userId room
  });

  socket.on("callUser", ({ to, from, signalData }) => {
    io.to(to).emit("incomingCall", { from, signalData });
  });

  socket.on("acceptCall", ({ to, signalData }) => {
    io.to(to).emit("callAccepted", { signalData });
  });

  // 🔥 HARD RESET EVENT
  socket.on("endCall", ({ to, from }) => {
    io.to(to).emit("callEnded");
    io.to(from).emit("callEnded");
  });

  socket.on("disconnect", () => {
    for (const [uid, sid] of userSocketMap.entries()) {
      if (sid === socket.id) {
        userSocketMap.delete(uid);
        break;
      }
    }
  });
});
