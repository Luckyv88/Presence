import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";

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
      <style>{`
  .register-wrapper {
  min-height: 100vh;            /* allow full screen height */
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: flex-start;      /* top-align so card doesn’t cut */
  padding: 40px 0;              /* space above/below */
  background: linear-gradient(135deg, #0a0f2e, #1f2a5f, #102061, #0a0f2e);
  background-size: 400% 400%;
  animation: gradientBG 25s ease infinite;
  font-family: 'Inter', sans-serif;
  overflow-y: auto;             /* allow page scrolling */
}

.register-card {
  width: 90%;
  max-width: 600px;
  max-height: 80vh;             /* card can grow but not exceed screen */
  background: rgba(15, 20, 45, 0.95);
  border-radius: 32px;
  border: 1px solid rgba(255, 255, 255, 0.15);
  padding: 40px;
  backdrop-filter: blur(14px);
  box-shadow: 0 20px 60px rgba(0, 255, 163, 0.25);

  display: flex;
  flex-direction: column;
  overflow-y: auto;             /* internal scroll if content exceeds card */
  scrollbar-width: thin;        /* Firefox */
  scrollbar-color: #00ffa3 transparent;
}

/* Chrome/Safari scrollbar */
.register-card::-webkit-scrollbar {
  width: 6px;
}

.register-card::-webkit-scrollbar-thumb {
  background: #00ffa3;
  border-radius: 10px;
}



        @keyframes gradientBG {
          0% { background-position: 0% 50%; }
          50% { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        /* REGISTER CARD */
        .register-card {
          width: 100%;
          max-width: 600px;
          background: rgba(15, 20, 45, 0.95);
          border-radius: 32px;
          border: 1px solid rgba(255, 255, 255, 0.15);
          padding: 40px;
          backdrop-filter: blur(14px);
          box-shadow: 0 20px 60px rgba(0, 255, 163, 0.25);
          display: flex;
          flex-direction: column;
          margin-bottom: 40px; /* Ensures space at the bottom after scrolling */
        }

        .title {
          font-size: 32px;
          font-weight: 700;
          margin-bottom: 30px;
          background: linear-gradient(135deg, #00ffa3, #6a5cff);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          text-align: center;
        }

        .avatar-section {
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 15px;
          margin-bottom: 30px;
        }

        .avatar-circle {
          width: 100px;
          height: 100px;
          border-radius: 50%;
          border: 3px solid #00ffa3;
          overflow: hidden;
          background: rgba(20, 30, 60, 0.85);
        }

        .avatar-circle img {
          width: 100%;
          height: 100%;
          object-fit: cover;
        }

        .onboarding-form {
          display: flex;
          flex-direction: column;
          gap: 20px;
        }

        .row {
          display: flex;
          gap: 20px;
        }

        .input-group {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 8px;
        }

        .input-group label {
          font-size: 14px;
          color: #b0b0b0;
        }

        .register-card input,
        .register-card textarea {
          padding: 14px 18px;
          border-radius: 15px;
          border: 2px solid rgba(255, 255, 255, 0.15);
          background: rgba(20, 30, 60, 0.85);
          color: #f0f0f0;
          font-size: 15px;
        }

        .register-card input:focus,
        .register-card textarea:focus {
          outline: none;
          border-color: #00ffa3;
          box-shadow: 0 0 15px rgba(0, 255, 163, 0.2);
        }

        .register-card textarea {
          min-height: 80px;
          resize: vertical;
        }

        .btn-primary {
          margin-top: 10px;
          padding: 16px;
          border-radius: 15px;
          border: none;
          font-weight: 700;
          background: linear-gradient(135deg, #00ffa3, #6a5cff);
          color: #0a0f2e;
          cursor: pointer;
        }

        .btn-secondary {
          padding: 8px 16px;
          border-radius: 10px;
          border: 1px solid #00ffa3;
          background: transparent;
          color: #00ffa3;
          cursor: pointer;
        }

        .toast-notification {
          position: fixed;
          top: 20px;
          right: 20px;
          padding: 15px 25px;
          border-radius: 10px;
          color: white;
          z-index: 1000;
        }
        .toast-notification.success { background: #00ffa3; color: #0a0f2e; }
        .toast-notification.error { background: #ff4b2b; }

        @media (max-width: 600px) {
          .row { flex-direction: column; }
          .register-card { padding: 25px; }
        }
      `}</style>

      {toast && (
        <div className={`toast-notification ${toast.includes('✅') ? 'success' : 'error'}`}>
          {toast}
        </div>
      )}

      <div className="register-card">
        <h1 className="title">Create Your Account</h1>

        <div className="avatar-section">
          <div className="avatar-circle">
            <img src={form.profilepic} alt="User Avatar" />
          </div>
          <button type="button" className="btn-secondary" onClick={generateAvatar}>
            Generate Random Avatar
          </button>
        </div>

        <form onSubmit={handleSubmit} className="onboarding-form">
          <div className="row">
            <div className="input-group">
              <label>Full Name</label>
              <input name="fullname" placeholder="John Doe" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Username</label>
              <input name="username" placeholder="johndoe123" onChange={handleChange} required />
            </div>
          </div>

          <div className="row">
            <div className="input-group">
              <label>Email</label>
              <input type="email" name="email" placeholder="email@example.com" onChange={handleChange} required />
            </div>
            <div className="input-group">
              <label>Phone Number</label>
              <input name="phone" placeholder="+123456789" onChange={handleChange} required />
            </div>
          </div>

          <div className="input-group">
            <label>Password</label>
            <input type="password" name="password" placeholder="Min 6 characters" onChange={handleChange} required />
          </div>

          <div className="input-group">
            <label>Bio</label>
            <textarea name="bio" placeholder="Tell us about yourself..." onChange={handleChange} />
          </div>

          <div className="input-group">
            <label>Location</label>
            <input name="location" placeholder="City, Country" onChange={handleChange} />
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