import React, { useState, useEffect } from "react";
import { api } from "../utils/api";
import "../styles/friendadd.css";

const FriendAdd = ({ currentUser, friendsList }) => {
  const [query, setQuery] = useState("");
  const [users, setUsers] = useState([]);
  const [message, setMessage] = useState("");

  // Safe defaults
  currentUser = currentUser || { _id: null, username: "" };
  friendsList = friendsList || [];

  useEffect(() => {
    if (!query.trim()) {
      setUsers([]);
      return;
    }

    const fetchUsers = async () => {
      try {
        const res = await api.get(`/friends/search?q=${query}`);
        setUsers(res.data.users || []);
      } catch (err) {
        console.error(err);
      }
    };

    fetchUsers();
  }, [query]);

  const handleAddFriend = async (username) => {
    try {
      const res = await api.post(`/friends/add/${username}`);
      setMessage(res.data.message);
    } catch (err) {
      setMessage(err.response?.data?.message || "Error");
    }
  };

  const isAlreadyFriend = (userId) => {
    return friendsList?.some((f) => f._id === userId);
  };

  return (
    <div className="friend-add-container">
      <h2>Add Friend</h2>

      <input
        type="text"
        placeholder="Search username..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
      />

      <div className="friend-results">
        {users.map((user) => {
          // Safe check
          const userId = user?._id;
          if (!userId) return null;

          return (
            <div key={userId} className="friend-card">
              <img src={user.profilepic || "/default-avatar.png"} alt="" />
              <div>
                <p>{user.fullname || "No Name"}</p>
                <span>@{user.username || "unknown"}</span>
              </div>

              {userId === currentUser?._id ? (
                <button disabled>You</button>
              ) : isAlreadyFriend(userId) ? (
                <button disabled>Already Friend</button>
              ) : (
                <button onClick={() => handleAddFriend(user.username)}>
                  Add
                </button>
              )}
            </div>
          );
        })}
      </div>

      {message && <p className="friend-message">{message}</p>}
    </div>
  );
};

export default FriendAdd;
