import React, { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Video, VideoOff, Mic, MicOff, PhoneOff } from 'lucide-react';

interface VideoCallProps {
  roomId: string;
  userId: string;
  onLeaveCall: () => void;
}

export const VideoCallChamber: React.FC<VideoCallProps> = ({ roomId, userId, onLeaveCall }) => {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  
  const socketRef = useRef<Socket | null>(null);
  const peerConnectionRef = useRef<RTCPeerConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Free Google public STUN servers to handle network routing (NAT bypass)
  const iceServers = {
    iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
  };

  useEffect(() => {
    // 1. Establish real-time WebSocket communication link with our port 5000 server
    socketRef.current = io('http://localhost:5000');

    // 2. Request webcam and microphone stream clearance from the browser
    navigator.mediaDevices.getUserMedia({ video: true, audio: true })
      .then((stream) => {
        localStreamRef.current = stream;
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }

        // Initialize our peer-to-peer configurations
        initiateWebRTC(stream);
      })
      .catch((err) => {
        console.error('Hardware webcam/mic access was denied or blocked:', err);
      });

    return () => {
      // Clean up hardware tracks and disconnect safely when leaving the call screen
      localStreamRef.current?.getTracks().forEach(track => track.stop());
      peerConnectionRef.current?.close();
      socketRef.current?.disconnect();
    };
  }, [roomId]);

  const initiateWebRTC = (stream: MediaStream) => {
    peerConnectionRef.current = new RTCPeerConnection(iceServers);
    
    // Feed local audio/video tracks into our WebRTC connection channel
    stream.getTracks().forEach(track => {
      peerConnectionRef.current?.addTrack(track, stream);
    });

    // Detect when the remote partner's video track arrives and attach it to the screen
    peerConnectionRef.current.ontrack = (event) => {
      if (remoteVideoRef.current && event.streams[0]) {
        remoteVideoRef.current.srcObject = event.streams[0];
      }
    };

    // Broadcast our network path candidates to the server
    peerConnectionRef.current.onicecandidate = (event) => {
      if (event.candidate) {
        socketRef.current?.emit('new-ice-candidate', { roomId, candidate: event.candidate });
      }
    };

    // Tell the backend socket server we are jumping into our designated meeting space
    socketRef.current?.emit('join-room', roomId, userId);

    // Event: A remote user joins the room -> Host sets up the network Connection Offer
    socketRef.current?.on('user-connected', async () => {
      const offer = await peerConnectionRef.current?.createOffer();
      await peerConnectionRef.current?.setLocalDescription(offer);
      socketRef.current?.emit('video-offer', { roomId, sdp: offer });
    });

    // Event: Receiver gets the Connection Offer -> Generates the Connection Answer response
    socketRef.current?.on('video-offer', async (sdp) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
      const answer = await peerConnectionRef.current?.createAnswer();
      await peerConnectionRef.current?.setLocalDescription(answer);
      socketRef.current?.emit('video-answer', { roomId, sdp: answer });
    });

    // Event: Host receives the final Answer back -> Completes Handshake connection loop
    socketRef.current?.on('video-answer', async (sdp) => {
      await peerConnectionRef.current?.setRemoteDescription(new RTCSessionDescription(sdp));
    });

    // Event: Exchange ICE candidates cleanly in mid-stream setup
    socketRef.current?.on('new-ice-candidate', async (candidate) => {
      try {
        await peerConnectionRef.current?.addIceCandidate(new RTCIceCandidate(candidate));
      } catch (e) {
        console.error("Error adding received ice candidate", e);
      }
    });
  };

  // Hardware control toggles
  const toggleMute = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getAudioTracks()[0].enabled = isMuted;
      setIsMuted(!isMuted);
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      localStreamRef.current.getVideoTracks()[0].enabled = isVideoOff;
      setIsVideoOff(!isVideoOff);
    }
  };

  return (
    <div className="flex flex-col items-center bg-gray-900 p-6 rounded-xl shadow-2xl text-white max-w-4xl mx-auto my-4">
      <h3 className="text-lg font-semibold tracking-wide mb-4">Boardroom Collaboration Stream</h3>
      
      {/* Video Screens Wrapper */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full h-[300px]">
        {/* Local Feed */}
        <div className="relative bg-black rounded-lg overflow-hidden border border-gray-800">
          <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 text-xs rounded">You (Local Camera)</span>
        </div>
        
        {/* Remote Feed */}
        <div className="relative bg-black rounded-lg overflow-hidden border border-gray-800 flex items-center justify-center">
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />
          <span className="absolute bottom-2 left-2 bg-black/70 px-2 py-0.5 text-xs rounded">Partner Connection</span>
        </div>
      </div>
      
      {/* Media Interaction Control Panel */}
      <div className="flex gap-4 mt-6">
        <button 
          onClick={toggleMute} 
          className={`p-3 rounded-full border transition-all ${isMuted ? 'bg-red-600 border-red-600 text-white' : 'border-gray-600 hover:bg-gray-800 text-gray-300'}`}
        >
          {isMuted ? <MicOff size={20} /> : <Mic size={20} />}
        </button>
        
        <button 
          onClick={toggleVideo} 
          className={`p-3 rounded-full border transition-all ${isVideoOff ? 'bg-red-600 border-red-600 text-white' : 'border-gray-600 hover:bg-gray-800 text-gray-300'}`}
        >
          {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
        </button>
        
        <button 
          onClick={onLeaveCall} 
          className="flex items-center gap-2 px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg shadow-md transition-all text-sm"
        >
          <PhoneOff size={18} /> Disconnect Session
        </button>
      </div>
    </div>
  );
};