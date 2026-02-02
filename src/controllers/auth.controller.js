import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multiavatar from "@multiavatar/multiavatar/esm";

import { upsertStreamUser } from "../lib/stream.js";
import User from "../models/User.js";

export const signup = async (req, res) => {
  const { fullname, username, email, phone, password } = req.body;

  try {
    //  Validate required fields
    if (!fullname || !username || !email || !phone || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email format" });
    }

    //  Validate phone number (must be 10 digits)
    const phoneRegex = /^\d{10}$/;
    if (!phoneRegex.test(phone)) {
      return res.status(400).json({ message: "Phone number must be 10 digits" });
    }

    // Check for existing user
    const userExists = await User.findOne({
      $or: [{ email }, { username }, { phone }],
    });

    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with given details" });
    }

    //  Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    //  Generate avatar using Multiavatar (SVG)
    const avatarSvg = multiavatar(username);
    const avatarBase64 = `data:image/svg+xml;base64,${Buffer.from(
      avatarSvg
    ).toString("base64")}`;

    // Create user
    const newUser = await User.create({
      fullname,
      username,
      email,
      phone,
      password: hashedPassword,
      profilepic: avatarBase64,
    });

    // Sync user with Stream (non-blocking)
    try {
      await upsertStreamUser({
        id: newUser._id.toString(),
        name: newUser.fullname,
        image: newUser.profilepic,
      });
      console.log("Stream sync successful for user:", newUser.fullname);
    } catch (err) {
      console.error("Stream sync failed:", err.message);
    }

    //  Generate JWT
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "7d" }
    );

    //  Secure cookie
   res.cookie("jwt", token, {
  httpOnly: true,
  sameSite: "none",        // allow cross-origin
  secure: true,            // required for HTTPS
  maxAge: 7 * 24 * 60 * 60 * 1000,
});


    //Response (never return password)
    res.status(201).json({
      success: true,
      user: {
        _id: newUser._id,
        fullname: newUser.fullname,
        username: newUser.username,
        email: newUser.email,
        phone: newUser.phone,
        profilepic: newUser.profilepic,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
}


export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) return res.status(400).json({ message: "All fields required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) return res.status(401).json({ message: "Invalid email or password" });

    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "7d" });

    // consistent cookie
    res.cookie("jwt", token, {
      httpOnly: true,
      sameSite: "none",  // allow cross-origin
      secure: true,      // must be HTTPS
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(200).json({
      success: true,
      user: {
        _id: user._id,
        fullname: user.fullname,
        username: user.username,
        email: user.email,
        phone: user.phone,
        profilepic: user.profilepic,
      },
    });
  } catch (error) {
    console.log("Login error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


export function logout(req, res) {
  res.clearCookie("jwt");
  res.status(200).json({ success: true, message: "Logout successful" });
}


