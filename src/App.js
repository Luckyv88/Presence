import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./components/Login";
import Register from "./components/Register";
import Home from "./components/Home";       // ✅ Import the new Home page
import Home1 from "./components/Home1";     // ✅ Existing call page
import FriendAdd from "./components/FriendAdd.jsx";
import { api } from "./utils/api";

const App = () => {
  const [user, setUser] = useState(null);

  useEffect(() => {
    // Check if user is already logged in (cookie-based)
    api
      .get("/auth/me")
      .then((res) => setUser(res.data.user))
      .catch(() => setUser(null));
  }, []);

  return (
    <Router>
      <Routes>
        {/* Login/Register */}
        <Route
          path="/login"
          element={!user ? <Login setUser={setUser} /> : <Navigate to="/home" />}
        />
        <Route
          path="/signup"
          element={!user ? <Register /> : <Navigate to="/home" />}
        />

        {/* Home page with all friends */}
        <Route
          path="/home"
          element={user ? <Home user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />

        {/* Home1 page with video call for selected friend */}
        <Route
          path="/home1"
          element={user ? <Home1 user={user} setUser={setUser} /> : <Navigate to="/login" />}
        />

        {/* Friend Add page */}
        <Route path="/friends/add" element={user ? <FriendAdd /> : <Navigate to="/login" />} />

        {/* Fallback route */}
        <Route path="*" element={<Navigate to="/login" />} />
      </Routes>
    </Router>
  );
};

export default App;
