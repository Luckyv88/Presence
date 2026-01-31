import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import {
  addFriend,
  getFriends,
  searchUsers
} from "../controllers/friend.controller.js";

const router = express.Router();

// ADD FRIEND BY USERNAME
router.post("/add/:username", protect, addFriend);

// GET FRIEND LIST
router.get("/list", protect, getFriends);

// SEARCH USERS
router.get("/search", protect, searchUsers);

export default router;
