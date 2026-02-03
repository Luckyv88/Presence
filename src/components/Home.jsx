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
      <Navbar user={user} setUser={setUser} />

      {/* MIDDLE SCROLLABLE AREA */}
      <div
        className="container"
        style={{
          height: "calc(100vh - 80px)", // navbar space
          overflowY: "auto",
          padding: "30px 40px",
        }}
      >
        {friends.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center", marginTop: "20px" }}>
            No friends found
          </p>
        ) : (
          <div
            className="friend-list"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)", // 4 per row
              gap: "30px", // SPECIFIC GAP BETWEEN CARDS
              justifyItems: "center",
              alignItems: "start",
            }}
          >
            {friends.map((friend) => {
              const status = friendStatus[friend._id] || "offline";
              let statusColor = "gray";
              if (status === "online") statusColor = "green";
              else if (status === "ringing") statusColor = "orange";

              return (
                <div
                  key={friend._id}
                  className="friend-card"
                  style={{
                    width: "220px", // fixed card width
                  }}
                >
                  <img
                    src={friend.profilepic || "/default-avatar.png"}
                    alt={friend.fullname}
                    className="friend-avatar"
                  />

                  <p className="friend-name">{friend.fullname}</p>

                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span
                      className="friend-status"
                      style={{ backgroundColor: statusColor }}
                      title={status}
                    ></span>

                    <span
                      style={{
                        fontSize: "0.9rem",
                        color: "#555",
                        fontWeight: "500",
                      }}
                    >
                      {status}
                    </span>
                  </div>

                  <button
                    onClick={() => handleVideoCall(friend._id)}
                    className="video-call-btn"
                  >
                    Video Call
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
