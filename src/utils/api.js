import axios from "axios";

export const api = axios.create({
  baseURL: "https://presence-f0s5.onrender.com",
  withCredentials: true, // send cookies for JWT auth
});
