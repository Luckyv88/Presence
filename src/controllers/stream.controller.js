import { generateStreamToken } from "../lib/stream.js";

export const getStreamToken = async (req, res) => {
  try {
    const token = generateStreamToken(req.user._id);

    res.status(200).json({
      success: true,
      token,
      userId: req.user._id,
      apiKey: process.env.STREAM_API_KEY,
    });
  } catch (error) {
    res.status(500).json({ message: "Token generation failed" });
  }
};
