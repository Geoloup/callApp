import { Peer } from 'peerjs';

let peer = null;
let localStream = null;
let currentCall = null;

// DOM Elements
const createBtn = document.getElementById('create-btn');
const callBtn = document.getElementById('call-btn');
const peerIdInput = document.getElementById('peer-id');
const peerIdToCall = document.getElementById('peer-id-to-call');
const useVideo = document.getElementById('use-video');
const useAudio = document.getElementById('use-audio');
const localVideo = document.getElementById('local-video');
const remoteVideo = document.getElementById('remote-video');
const connectionInfo = document.getElementById('connection-info');
const displayedPeerId = document.getElementById('displayed-peer-id');

// Initialize peer connection
createBtn.addEventListener('click', async () => {
  const desiredPeerId = peerIdInput.value.trim();
  peer = new Peer(desiredPeerId || undefined);

  peer.on('open', (id) => {
    displayedPeerId.textContent = id;
    connectionInfo.classList.remove('hidden');
    createBtn.disabled = true;
    callBtn.disabled = false;
    peerIdInput.disabled = true;
  });

  // Handle incoming calls
  peer.on('call', async (call) => {
      // Get local stream with current audio/video preferences
      const stream = await getLocalStream();
      call.answer(stream);
      handleCall(call);
  });

  // Get initial local stream
  try {
    localStream = await getLocalStream();
    localVideo.srcObject = localStream;
  } catch (err) {
    console.error('Failed to get local stream:', err);
  }
});

// Handle outgoing calls
callBtn.addEventListener('click', async () => {
  const remotePeerId = peerIdToCall.value.trim();
  if (!remotePeerId) {
    alert('Please enter a Peer ID to call');
    return;
  }

  try {
    // Get fresh stream with current audio/video preferences
    const stream = await getLocalStream();
    const call = peer.call(remotePeerId, stream);
    handleCall(call);
  } catch (err) {
    console.error('Failed to make call:', err);
    alert('Failed to make call. Please check your camera/microphone permissions.');
  }
});

// Handle media preference changes
useVideo.addEventListener('change', updateLocalStream);
useAudio.addEventListener('change', updateLocalStream);

async function getLocalStream() {
  // Stop existing tracks
  if (localStream) {
    localStream.getTracks().forEach(track => track.stop());
  }

  // Get new stream with current preferences

  const cameraSelect = document.getElementById('select-video');
  const selectedDeviceId = cameraSelect.value;

  const stream = await navigator.mediaDevices.getUserMedia({
    video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
    audio: true
  });
  
  localStream = stream;
  localVideo.srcObject = stream;
  return stream;
}

async function updateLocalStream() {
  try {
    const stream = await getLocalStream();
    
    // If there's an ongoing call, replace the tracks
    if (currentCall && currentCall.peerConnection) {
      const senders = currentCall.peerConnection.getSenders();
      const tracks = stream.getTracks();
      
      for (const sender of senders) {
        const track = tracks.find(t => t.kind === sender.track.kind);
        if (track) {
          sender.replaceTrack(track);
        }
      }
    }
  } catch (err) {
    console.error('Failed to update local stream:', err);
  }
}

function handleCall(call) {
  currentCall = call;
  
  call.on('stream', (remoteStream) => {
    remoteVideo.srcObject = remoteStream;
  });

  call.on('close', () => {
    remoteVideo.srcObject = null;
  });

  call.on('error', (err) => {
    console.error('Call error:', err);
    remoteVideo.srcObject = null;
  });
}

// Error handling
window.onerror = function(msg, url, lineNo, columnNo, error) {
  console.error('Error: ', msg, '\nURL: ', url, '\nLine: ', lineNo, '\nColumn: ', columnNo, '\nError object: ', error);
  return false;
};