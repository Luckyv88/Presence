import mongoose from "mongoose";
import User from "../models/User.js";

export const addFriend = async (req, res) => {
  const { username } = req.params;

  try {
    // Logged-in user
    const user = await User.findById(req.user._id);
    if (!user) return res.status(404).json({ message: "User not found" });

    //  Prevent adding yourself
    if (user.username === username) {
      return res.status(400).json({ message: "You cannot add yourself" });
    }

    //  Find friend by USERNAME (NOT ID)
    const friend = await User.findOne({ username });
    if (!friend) return res.status(404).json({ message: "User not found" });

    //  Already friends check
    if (user.friends.includes(friend._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    //  Add each other
    user.friends.push(friend._id);
    friend.friends.push(user._id);

    //  Save
    await user.save();
    await friend.save();

    res.status(200).json({
      success: true,
      message: "Friend added successfully",
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate(
      "friends",
      "_id fullname username profilepic"
    );
    res.status(200).json({ success: true, friends: user.friends });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const searchUsers = async (req, res) => {
  try {
    const { q } = req.query;

    if (!q) return res.status(200).json({ users: [] });

    const users = await User.find({
      username: { $regex: q, $options: "i" },
      _id: { $ne: req.user._id },
    }).select("_id fullname username profilepic");

    res.status(200).json({ success: true, users });
  } catch (error) {
    res.status(500).json({ message: "Server error" });
  }
};
