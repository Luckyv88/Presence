import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Navbar from "./Navbar";
import socket from "../socket";
import "../styles/home1.css";

const Home = ({ user, setUser }) => {
  const [friends, setFriends] = useState([]);
  const [friendStatus, setFriendStatus] = useState({});
  const navigate = useNavigate();

  const fetchFriends = async () => {
    try {
      const res = await api.get("/friends/list");
      setFriends(res.data.friends);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchFriends();

    socket.on("updateStatus", ({ userId, status }) => {
      setFriendStatus((prev) => ({ ...prev, [userId]: status }));
    });

    return () => {
      socket.off("updateStatus");
    };
  }, []);

  const handleVideoCall = (friendId) => {
    navigate("/home1", { state: { friendId } });
  };

  return (
    <>
      {/* 1. Navbar stays fixed as per your code */}
      <Navbar user={user} setUser={setUser} />

      {/* 2. Main Container starts AFTER the navbars using your CSS .container class */}
      <div className="container" style={{ 
        overflowY: "auto", 
        padding: "40px", 
        background: "transparent",
        height: "calc(100vh - 70px)" // Ensures the middle part fills the screen height
      }}>
        
        {/* 3. Grid layout for Friend Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(200px, 1fr))",
          gap: "30px",
          width: "100%",
          justifyItems: "center"
        }}>
          {friends.length === 0 ? (
            <p style={{ color: "var(--text-muted)", textAlign: "center", gridColumn: "1/-1", marginTop: "50px" }}>
              No friends found
            </p>
          ) : (
            friends.map((friend) => {
              // Status logic
              const status = friendStatus[friend._id] || "offline";
              let statusColor = "#888"; 
              if (status === "online") statusColor = "#00ffa3"; 
              else if (status === "ringing") statusColor = "#ff4ad9"; 

              return (
                <div
                  key={friend._id}
                  style={{
                    width: "200px",
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    padding: "20px",
                    borderRadius: "20px",
                    background: "var(--card-bg)", // Glassy theme from your CSS
                    backdropFilter: "blur(12px)",
                    border: "1px solid var(--border-color)",
                    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
                    transition: "var(--transition)"
                  }}
                >
                  {/* User Profile Image */}
                  <img
                    src={friend.profilepic || "/default-avatar.png"}
                    alt={friend.fullname}
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      marginBottom: "12px",
                      border: `2px solid ${statusColor}`,
                      padding: "3px",
                      objectFit: "cover"
                    }}
                  />

                  {/* Name and Status */}
                  <p style={{ fontWeight: "600", color: "var(--text-main)", marginBottom: "4px" }}>
                    {friend.fullname}
                  </p>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "15px" }}>
                    <span style={{ 
                      backgroundColor: statusColor, 
                      width: "10px", 
                      height: "10px", 
                      borderRadius: "50%",
                      boxShadow: status === "online" ? `0 0 10px ${statusColor}` : "none" 
                    }}></span>
                    <span style={{ fontSize: "0.8rem", color: "var(--text-muted)" }}>{status}</span>
                  </div>

                  {/* Action Button */}
                  <button
                    onClick={() => handleVideoCall(friend._id)}
                    style={{
                      width: "100%",
                      padding: "10px",
                      borderRadius: "12px",
                      background: status === "online" ? "var(--primary-gradient)" : "rgba(255,255,255,0.05)",
                      color: status === "online" ? "#0c0f25" : "#777",
                      cursor: status === "online" ? "pointer" : "not-allowed",
                      border: "none",
                      fontWeight: "bold",
                      transition: "var(--transition)"
                    }}
                    disabled={status !== "online"}
                  >
                    Video Call
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>
    </>
  );
};

export default Home;