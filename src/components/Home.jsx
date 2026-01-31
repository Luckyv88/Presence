import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/api";
import Navbar from "./Navbar";
import "../styles/home1.css";

const Home = ({ user, setUser }) => {
  const [friends, setFriends] = useState([]);
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
  }, []);

  const handleVideoCall = (friendId) => {
    // Navigate to Home1.js page with the selected friendId
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
            {friends.map((friend) => (
              <div key={friend._id} className="friend-card">
                <img
                  src={friend.profilepic || "/default-avatar.png"}
                  alt={friend.fullname}
                  className="friend-avatar"
                />
                <p className="friend-name">{friend.fullname}</p>
                <button
                  onClick={() => handleVideoCall(friend._id)}
                  className="video-call-btn"
                >
                  Video Call
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  );
};

export default Home;
