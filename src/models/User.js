import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    fullname: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
    },
    bio: {
      type: String,
      default: "",
    },
    phone: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    profilepic: {
  type: String,
   default: "",
},
    location: {
      type: String,
      required: false,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
     friends:[{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
     }],
      isOnboarded: {
      type: Boolean,
      default: false,
    },
    
  },
  { timestamps: true },
);

const User = mongoose.model("User", userSchema);

export default User;
