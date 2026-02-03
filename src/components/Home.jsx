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

      {/* Scrollable middle section */}
      <div
  style={{
    height: "calc(100vh - 80px)", // full height minus navbar
    overflowY: "auto",
    padding: "20px",
    display: "grid",
    gridTemplateColumns: "repeat(4, 1fr)", // 4 cards per row
    gap: "20px",
    justifyItems: "center", // center each card horizontally
    alignContent: "start",  // start from top but stays centered vertically when few users
  }}
>
        {friends.length === 0 ? (
          <p style={{ color: "#aaa", textAlign: "center", marginTop: "20px" }}>
            No friends found
          </p>
        ) : (
          friends.map((friend) => {
            const status = friendStatus[friend._id] || "offline";
            let statusColor = "gray";
            if (status === "online") statusColor = "green";
            else if (status === "ringing") statusColor = "orange";

            return (
              <div
                key={friend._id}
                style={{
                  flex: "0 0 180px", // minimized width
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  padding: "10px",
                  borderRadius: "8px",
                  background: "#f9f9f9",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.1)",
                }}
              >
                <img
                  src={friend.profilepic || "/default-avatar.png"}
                  alt={friend.fullname}
                  style={{
                    width: "60px",
                    height: "60px",
                    borderRadius: "50%",
                    marginBottom: "8px",
                  }}
                />
                <p
                  style={{
                    fontWeight: "600",
                    fontSize: "0.9rem",
                    marginBottom: "6px",
                    textAlign: "center",
                  }}
                >
                  {friend.fullname}
                </p>

                <span
                  style={{
                    backgroundColor: statusColor,
                    width: "10px",
                    height: "10px",
                    borderRadius: "50%",
                    display: "inline-block",
                    marginBottom: "4px",
                  }}
                  title={status}
                ></span>
                <span
                  style={{
                    fontSize: "0.8rem",
                    color: "#555",
                    fontWeight: "500",
                    marginBottom: "8px",
                  }}
                >
                  {status}
                </span>

                <button
                  onClick={() => handleVideoCall(friend._id)}
                  style={{
                    padding: "5px 10px",
                    borderRadius: "5px",
                    border: "none",
                    background: "#4caf50",
                    color: "#fff",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                    fontWeight: "600",
                  }}
                >
                  Video Call
                </button>
              </div>
            );
          })
        )}
      </div>
    </>
  );
};

export default Home;
