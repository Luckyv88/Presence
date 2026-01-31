import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "simple-peer";
import socket from "../socket"; // ✅ SINGLE SOCKET INSTANCE

const CallButton = ({ friendId, userId }) => {
  const navigate = useNavigate();

  const [stream, setStream] = useState(null);
  const [receivingCall, setReceivingCall] = useState(false);
  const [callerSignal, setCallerSignal] = useState(null);

  const myVideo = useRef(null);
  const friendVideo = useRef(null);
  const connectionRef = useRef(null);

  const joinedRef = useRef(false);
  const callActiveRef = useRef(false);
  const signalingDoneRef = useRef(false);

  useEffect(() => {
    // 🎥 Get media
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        setStream(s);
        if (myVideo.current) {
          myVideo.current.srcObject = s;
        }
      });

    // ✅ Join socket room ONCE
    if (!joinedRef.current) {
      socket.emit("join", userId);
      joinedRef.current = true;
    }

    // 📞 Incoming call
    socket.on("incomingCall", ({ from, signalData, callType }) => {
      if (callActiveRef.current) return;
      if (callType !== "video") return;

      setReceivingCall(true);
      setCallerSignal({ from, signalData });
    });

    // ✅ Call accepted (initiator side)
    socket.on("callAccepted", ({ signalData }) => {
      if (
        !connectionRef.current ||
        connectionRef.current.destroyed ||
        signalingDoneRef.current
      )
        return;

      connectionRef.current.signal(signalData);
      signalingDoneRef.current = true;
    });

    // ☎️ Call ended by other user
  socket.on("callEnded", () => {
  if (!callActiveRef.current) return;
  cleanupCall();
  navigate("/home", { replace: true });
});

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");

      socket.emit("leaveCall", { userId });
      cleanupCall();
    };
  }, [navigate, userId]);

  // 📤 Call friend (initiator)
  const callUser = () => {
    if (!stream || callActiveRef.current) return;

    callActiveRef.current = true;
    signalingDoneRef.current = false;

    const peer = new Peer({
      initiator: true,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("callUser", {
        to: friendId,
        from: userId,
        signalData: data,
        callType: "video",
      });
    });

    peer.on("stream", (remote) => {
      if (friendVideo.current) {
        friendVideo.current.srcObject = remote;
      }
    });

    peer.on("close", cleanupCall);
    peer.on("error", cleanupCall);

    connectionRef.current = peer;
  };

  // 📥 Answer call (receiver)
  const answerCall = () => {
    if (!callerSignal || callActiveRef.current) return;

    callActiveRef.current = true;
    setReceivingCall(false);

    const peer = new Peer({
      initiator: false,
      trickle: false,
      stream,
    });

    peer.on("signal", (data) => {
      socket.emit("acceptCall", {
        to: callerSignal.from,
        signalData: data,
      });
    });

    peer.on("stream", (remote) => {
      if (friendVideo.current) {
        friendVideo.current.srcObject = remote;
      }
    });

    peer.on("close", cleanupCall);
    peer.on("error", cleanupCall);

    // ❗ DO NOT mark signaling done here
    peer.signal(callerSignal.signalData);

    connectionRef.current = peer;
  };

  // ❌ End call
const endCall = () => {
  // Remove the check to allow clicking even after call ended
  socket.emit("endCall", {
    to: callerSignal?.from || friendId,
    from: userId,
  });

  cleanupCall();
  navigate("/home", { replace: true });
};
 // ... existing code ...

// 🧹 Cleanup (SAFE & FINAL)
const cleanupCall = () => {
  callActiveRef.current = false;
  signalingDoneRef.current = false;

  if (connectionRef.current) {
    connectionRef.current.destroy();
    connectionRef.current = null;
  }

  if (friendVideo.current) {
    friendVideo.current.srcObject = null;
  }

  // Stop the local media stream to turn off camera and mic
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  }

  if (myVideo.current) {
    myVideo.current.srcObject = null;
  }

  setReceivingCall(false);
  setCallerSignal(null);
};

// ... existing code ...

  // ⛔ JSX — 100% UNCHANGED
  return (
    <div style={{ width: "100%" }}>
      <div className="video-split">
        <video
          ref={myVideo}
          autoPlay
          playsInline
          muted
          className="full-screen-video"
        />
        <video
          ref={friendVideo}
          autoPlay
          playsInline
          className="full-screen-video"
        />
      </div>

      <div className="controls">
        <button onClick={callUser}>Call Friend</button>
        {receivingCall && <button onClick={answerCall}>Answer</button>}
        <button
          onClick={endCall}
          style={{ background: "red", color: "#fff" }}
        >
          End Call
        </button>
      </div>
    </div>
  );
};

export default CallButton;
