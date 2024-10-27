const signalingServer = new WebSocket("ws://localhost:3000");
let localStream;
let peerConnection;
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const localVideo = document.getElementById("localVideo");
const remoteVideo = document.getElementById("remoteVideo");

async function init() {
  try {
    // Get local media stream
    localStream = await navigator.mediaDevices.getUserMedia({ video: true });
    console.log("Local stream initialized:", localStream);
    localVideo.srcObject = localStream;

    // Create peer connection
    peerConnection = new RTCPeerConnection(config);
    console.log("Peer connection created:", peerConnection);

    // Add local stream to peer connection
    localStream.getTracks().forEach((track) => {
      console.log("Adding track:", track);
      peerConnection.addTrack(track, localStream);
    });

    // Send ICE candidates to signaling server
    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        console.log("New ICE candidate:", event.candidate);
        signalingServer.send(JSON.stringify({ candidate: event.candidate }));
      }
    };

    // Receive remote stream
    peerConnection.ontrack = (event) => {
      console.log("Received remote track:", event.streams[0]);
      remoteVideo.srcObject = event.streams[0];
    };

    // Listen for messages from signaling server
    signalingServer.onmessage = async (message) => {
      console.log("Received message:", message.data);
      // Existing message handling code...
    };

    // Create an offer after peer connection is initialized
    await createOffer();
  } catch (error) {
    console.error("Error initializing WebRTC:", error);
  }
}

// Create an offer
async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  signalingServer.send(JSON.stringify({ offer }));
}

signalingServer.onopen = () => {
  init();
};
