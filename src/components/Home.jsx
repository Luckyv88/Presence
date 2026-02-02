import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Navbar from "./Navbar";
import socket from "../socket"; // 🔥 added
import "../styles/home1.css";

const Home = ({ user, setUser }) => {
  const [friends, setFriends] = useState([]);
  const [friendStatus, setFriendStatus] = useState({}); // 🔥 friend statuses
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

    // 🔥 Listen for friend status updates
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
      <div className="container">
        {friends.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center", marginTop: "20px" }}>
            No friends found
          </p>
        ) : (
          <div className="friend-list">
            {friends.map((friend) => {
              const status = friendStatus[friend._id] || "offline";
              let statusColor = "gray";
              if (status === "online") statusColor = "green";
              else if (status === "ringing") statusColor = "orange";

              return (
                <div key={friend._id} className="friend-card">
                  <img
                    src={friend.profilepic || "/default-avatar.png"}
                    alt={friend.fullname}
                    className="friend-avatar"
                  />
                  <p className="friend-name">{friend.fullname}</p>

                  {/* 🔥 Status Indicator */}
                  <span
                    className="friend-status"
                    style={{
                      width: "10px",
                      height: "10px",
                      borderRadius: "50%",
                      display: "inline-block",
                      marginRight: "5px",
                      backgroundColor: statusColor,
                    }}
                    title={status}
                  ></span>

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
