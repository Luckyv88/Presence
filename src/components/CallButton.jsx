import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import Peer from "simple-peer";
import socket from "../socket";

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
      if (stream) {
    stream.getTracks().forEach(track => track.stop());
    setStream(null);
  }
    navigator.mediaDevices
      .getUserMedia({ video: true, audio: true })
      .then((s) => {
        setStream(s);
        if (myVideo.current) myVideo.current.srcObject = s;
      });

    if (!joinedRef.current) {
      socket.emit("join", userId);
      joinedRef.current = true;
    }

socket.on("incomingCall", (data) => {
  if (!data) return; 

  const { from, signalData, callType } = data || {};

  if (!from || !signalData || callType !== "video") return;

  if (callActiveRef.current) return;

  setReceivingCall(true);
  setCallerSignal({ from, signalData });
});



   socket.on("callAccepted", (data) => {
  if (!data || !data.signalData) return;
  if (!connectionRef.current || connectionRef.current.destroyed || signalingDoneRef.current) return;

  connectionRef.current.signal(data.signalData);
  signalingDoneRef.current = true;
});


    // ✅ Fixed: always clean up on call ended
   socket.on("callEnded", () => {
  hardReset();
});

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");

      socket.emit("leaveCall", { userId });
      cleanupCall();
    };
  }, [navigate, userId]);

  const callUser = () => {
    if (!stream || callActiveRef.current) return;

    callActiveRef.current = true;
    signalingDoneRef.current = false;

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", (data) => {
      socket.emit("callUser", { to: friendId, from: userId, signalData: data, callType: "video" });
    });

    peer.on("stream", (remote) => {
      if (friendVideo.current) friendVideo.current.srcObject = remote;
    });

    peer.on("close", cleanupCall);
    peer.on("error", cleanupCall);

    connectionRef.current = peer;
  };

const answerCall = () => {
  // ✅ Check that callerSignal exists and has signalData
  if (!callerSignal || !callerSignal.signalData || callActiveRef.current) return;

  callActiveRef.current = true;
  setReceivingCall(false);

  const peer = new Peer({ initiator: false, trickle: false, stream });

  peer.on("signal", (data) => {
    socket.emit("acceptCall", { to: callerSignal.from, signalData: data });
  });

  peer.on("stream", (remote) => {
    if (friendVideo.current) friendVideo.current.srcObject = remote;
  });

  peer.on("close", cleanupCall);
  peer.on("error", cleanupCall);

  // ✅ Only call signal if signalData exists
  peer.signal(callerSignal.signalData);

  connectionRef.current = peer;
};


const endCall = () => {
  socket.emit("endCall", {
    to: callerSignal?.from || friendId,
    from: userId,
  });

  // 🔥 Update friend status to online after ending call
  if (callerSignal?.from) {
    socket.emit("updateStatus", { userId: callerSignal.from, status: "online" });
  }

  hardReset();
};

const hardReset = () => {
  // 🔥 DESTROY PEER
  if (connectionRef.current) {
    connectionRef.current.destroy();
    connectionRef.current = null;
  }

  // 🔥 STOP MEDIA
  if (stream) {
    stream.getTracks().forEach(t => t.stop());
    setStream(null);
  }

  // 🔥 CLEAR UI
  if (myVideo.current) myVideo.current.srcObject = null;
  if (friendVideo.current) friendVideo.current.srcObject = null;

  setReceivingCall(false);
  setCallerSignal(null);

  // 🔥 FORCE SOCKET RESET
  socket.off();
  socket.emit("join", userId);

  // 🔥 GO HOME (OWN USER)
  navigate("/home", { replace: true });
};


  const cleanupCall = () => {
    callActiveRef.current = false;
    signalingDoneRef.current = false;

    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    if (friendVideo.current) friendVideo.current.srcObject = null;
    if (myVideo.current) myVideo.current.srcObject = null;

    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }

    setReceivingCall(false);
    setCallerSignal(null);
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="video-split">
        <video ref={myVideo} autoPlay playsInline muted className="full-screen-video" />
        <video ref={friendVideo} autoPlay playsInline className="full-screen-video" />
      </div>

      <div className="controls">
        <button onClick={callUser}>Call Friend</button>
        {receivingCall && <button onClick={answerCall}>Answer</button>}
        <button onClick={endCall} style={{ background: "red", color: "#fff" }}>End Call</button>
      </div>
    </div>
  );
};

export default CallButton;
