import React from "react";
import CallButton from "./CallButton";
import "../styles/home.css";

const FriendCard = ({ friend, userId }) => {
  return (
    <div className="friend-card">
      <img src={friend.profilepic} alt={friend.username} />
      <div>
        <span style={{ fontWeight: 600, fontSize: "18px" }}>{friend.fullname}</span>
      </div>
      <CallButton friendId={friend._id} userId={userId} />
    </div>
  );
};

export default FriendCard;
