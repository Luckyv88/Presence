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

                  {/* Status dot and inline-styled text */}
                  <span
                    className="friend-status"
                    style={{ backgroundColor: statusColor }}
                    title={status}
                  ></span>
                  <span
                    style={{
                      marginRight: "10px",
                      fontSize: "0.9rem",
                      color: "#555",
                      fontWeight: "500",
                      verticalAlign: "middle",
                    }}
                  >
                    {status}
                  </span>

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
