const signalingServer = new WebSocket("ws://localhost:3000");
let localStream: MediaStream;
let peerConnection: RTCPeerConnection;
const config = { iceServers: [{ urls: "stun:stun.l.google.com:19302" }] };

const localVideo = document.getElementById("localVideo") as HTMLVideoElement;
const remoteVideo = document.getElementById("remoteVideo") as HTMLVideoElement;

async function init() {
  // Get local media stream
  localStream = await navigator.mediaDevices.getUserMedia({ video: true });
  localVideo.srcObject = localStream;

  // Create peer connection
  peerConnection = new RTCPeerConnection(config);

  // Add local stream to peer connection
  localStream
    .getTracks()
    .forEach((track) => peerConnection.addTrack(track, localStream));

  // Send ICE candidates to signaling server
  peerConnection.onicecandidate = (event) => {
    if (event.candidate) {
      signalingServer.send(JSON.stringify({ candidate: event.candidate }));
    }
  };

  // Receive remote stream
  peerConnection.ontrack = (event) => {
    remoteVideo.srcObject = event.streams[0];
  };

  // Listen for messages from signaling server
  signalingServer.onmessage = async (message) => {
    const data = JSON.parse(message.data);

    if (data.offer) {
      // Handle incoming offer
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.offer)
      );
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      signalingServer.send(JSON.stringify({ answer }));
    } else if (data.answer) {
      // Handle incoming answer
      await peerConnection.setRemoteDescription(
        new RTCSessionDescription(data.answer)
      );
    } else if (data.candidate) {
      // Handle incoming ICE candidate
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.candidate));
    }
  };
}

// Create an offer
async function createOffer() {
  const offer = await peerConnection.createOffer();
  await peerConnection.setLocalDescription(offer);
  signalingServer.send(JSON.stringify({ offer }));
}

signalingServer.onopen = () => {
  init();
  createOffer();
};
