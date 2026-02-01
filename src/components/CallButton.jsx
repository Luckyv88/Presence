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
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then(s => {
      setStream(s);
      if (myVideo.current) myVideo.current.srcObject = s;
    });

    if (!joinedRef.current) {
      socket.emit("join", userId);
      joinedRef.current = true;
    }

    socket.on("incomingCall", ({ from, signalData }) => {
      if (callActiveRef.current) return;
      setReceivingCall(true);
      setCallerSignal({ from, signalData });
    });

    socket.on("callAccepted", ({ signalData }) => {
      if (!connectionRef.current || signalingDoneRef.current) return;
      connectionRef.current.signal(signalData);
      signalingDoneRef.current = true;
    });

    socket.on("callEnded", () => {
      cleanupCall();
      navigate("/home", { replace: true });
    });

    return () => {
      socket.off("incomingCall");
      socket.off("callAccepted");
      socket.off("callEnded");
      cleanupCall();
    };
  }, [navigate, userId]);

  const callUser = () => {
    if (!stream || callActiveRef.current) return;
    callActiveRef.current = true;

    const peer = new Peer({ initiator: true, trickle: false, stream });

    peer.on("signal", data => {
      socket.emit("callUser", {
        to: friendId,
        from: userId,
        signalData: data,
        callType: "video"
      });
    });

    peer.on("stream", remote => {
      if (friendVideo.current) friendVideo.current.srcObject = remote;
    });

    peer.on("close", cleanupCall);
    peer.on("error", cleanupCall);

    connectionRef.current = peer;
  };

  const answerCall = () => {
    if (!callerSignal) return;
    callActiveRef.current = true;
    setReceivingCall(false);

    const peer = new Peer({ initiator: false, trickle: false, stream });

    peer.on("signal", data => {
      socket.emit("acceptCall", {
        to: callerSignal.from,
        signalData: data
      });
    });

    peer.on("stream", remote => {
      if (friendVideo.current) friendVideo.current.srcObject = remote;
    });

    peer.signal(callerSignal.signalData);
    connectionRef.current = peer;
  };

  const endCall = () => {
    socket.emit("endCall", {
      to: callerSignal?.from || friendId,
      from: userId
    });
    cleanupCall();
    navigate("/home", { replace: true });
  };

  const cleanupCall = () => {
    callActiveRef.current = false;
    signalingDoneRef.current = false;

    if (connectionRef.current) {
      connectionRef.current.destroy();
      connectionRef.current = null;
    }

    if (stream) {
      stream.getTracks().forEach(t => t.stop());
      setStream(null);
    }

    if (myVideo.current) myVideo.current.srcObject = null;
    if (friendVideo.current) friendVideo.current.srcObject = null;

    setReceivingCall(false);
    setCallerSignal(null);
  };

  return (
    <div style={{ width: "100%" }}>
      <div className="video-split">
        <video ref={myVideo} autoPlay muted playsInline />
        <video ref={friendVideo} autoPlay playsInline />
      </div>

      <div className="controls">
        <button onClick={callUser}>Call Friend</button>
        {receivingCall && <button onClick={answerCall}>Answer</button>}
        <button onClick={endCall} style={{ background: "red", color: "#fff" }}>
          End Call
        </button>
      </div>
    </div>
  );
};

export default CallButton;
