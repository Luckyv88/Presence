import express from "express";
import { protect } from "../middleware/auth.middleware.js";
import { getStreamToken } from "../controllers/stream.controller.js";

const router = express.Router();

router.get("/token", protect, getStreamToken);

export default router;
