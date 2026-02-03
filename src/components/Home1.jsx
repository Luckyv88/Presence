import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom"; // Add this
import { api } from "../utils/api";
import Navbar from "./Navbar";
import CallButton from "./CallButton";
import "../styles/home1.css";

const Home1 = ({ user, setUser }) => {
  const [friends, setFriends] = useState([]);
  const location = useLocation(); // useLocation hook
  const selectedFriendId = location.state?.friendId;

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

  return (
    <>
      <Navbar user={user} setUser={setUser} />
      <div className="container">
        {selectedFriendId ? (
          <CallButton friendId={selectedFriendId} userId={user._id} />
        ) : (
          <p style={{ color: "#aaa", textAlign: "center", marginTop: "20px" }}>
            No friend selected for call
          </p>
        )}
      </div>
    </>
  );
};

export default Home1;
