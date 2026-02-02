import { io } from "socket.io-client";

const socket = io("http://localhost:5000",{
  transports: ["websocket"],
  withCredentials: true,
});

export default socket;

//https://presence-f0s5.onrender.com