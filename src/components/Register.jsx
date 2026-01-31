import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import "../styles/register.css";

const Register = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    fullname: "",
    username: "",
    email: "",
    phone: "",
    password: "",
    bio: "",
    location: "",
    profilepic: `https://api.dicebear.com/7.x/avataaars/svg?seed=${Math.random()}`,
    isOnboarded: true,
  });

  const [toast, setToast] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const generateAvatar = () => {
    const newSeed = Math.floor(Math.random() * 10000);
    const newPic = `https://api.dicebear.com/7.x/avataaars/svg?seed=${newSeed}`;
    setForm({ ...form, profilepic: newPic });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await api.post("/auth/signup", form);
      setToast("✅ Registration Successful!");
      setTimeout(() => navigate("/login"), 1200);
    } catch (err) {
      setToast(err.response?.data?.message || "❌ Signup Failed!");
      console.error(err);
    }
  };

  return (
    <div className="register-wrapper">
      {toast && <div className="toast-notification">{toast}</div>}
      <div className="register-card">
        <h1 className="title">Create Your Account</h1>

        <div className="avatar-section">
          <div className="avatar-circle">
            <img src={form.profilepic} alt="User Avatar" />
          </div>
          <button
            type="button"
            className="btn-secondary"
            onClick={generateAvatar}
          >
            Generate Random Avatar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="row">
            <div className="input-group">
              <label>Full Name</label>
              <input
                name="fullname"
                placeholder="John Doe"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input
                name="username"
                placeholder="johndoe123"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="row">
            <div className="input-group">
              <label>Email</label>
              <input
                type="email"
                name="email"
                placeholder="email@example.com"
                onChange={handleChange}
                required
              />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input
                name="phone"
                placeholder="+123456789"
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              placeholder="Min 6 characters"
              onChange={handleChange}
              required
            />
          </div>

          <div className="input-group">
            <label>Bio</label>
            <textarea
              name="bio"
              placeholder="Tell us about yourself..."
              onChange={handleChange}
            />
          </div>

          <div className="input-group">
            <label>Location</label>
            <input
              name="location"
              placeholder="City, Country"
              onChange={handleChange}
            />
          </div>

          <button type="submit" className="btn-primary">
            Complete Registration
          </button>
        </form>
      </div>
    </div>
  );
};

export default Register;
