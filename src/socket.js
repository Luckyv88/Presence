import { io } from "socket.io-client";

const socket = io("https://presence-f0s5.onrender.com",{
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;

