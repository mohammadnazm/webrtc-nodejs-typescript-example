const signalingServer = new WebSocket("ws://localhost:3000");
let localStream;
let peerConnection;
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

async function init() {
  try {
    localStream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Local stream initialized:", localStream);
    localVideo.srcObject = localStream;

    peerConnection = new RTCPeerConnection(config);
    console.log("Peer connection created:", peerConnection);

    localStream.getTracks().forEach((track) => {
      console.log("Adding track:", track);
      peerConnection.addTrack(track, localStream);
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
        signalingServer.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    peerConnection.ontrack = (event) => {
      console.log("Received remote track:", event.streams[0]);
      remoteVideo.srcObject = event.streams[0];
    };

    signalingServer.onmessage = async (message) => {
      console.log("Received message:", message.data);
    };

    await createOffer();
  } catch (error) {
    console.error("Error initializing WebRTC:", error);
  }
}

async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  signalingServer.send(JSON.stringify({ offer }));
}

signalingServer.onopen = () => {
  init();
};
