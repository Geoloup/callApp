import { MediaUtils } from './mediaUtils.js';
import { PeerUtils } from './peerUtils.js';
import { CallView } from './callView.js';
import { MediaPreview } from './mediaPreview.js';

// DOM Elements
const setupForm = document.getElementById('setup-form');
const hostBtn = document.getElementById('host-btn');
const joinBtn = document.getElementById('join-btn');
const hostId = document.getElementById('host-id');
const joinId = document.getElementById('join-id');
const useVideo = document.getElementById('use-video');
const useAudio = document.getElementById('use-audio');
const displayedRoomId = document.getElementById('displayed-room-id');
const connectionInfo = document.getElementById('connection-info');
const selector = document.getElementById('select-video');

// Initialize utilities and views
const mediaUtils = new MediaUtils();
const peerUtils = new PeerUtils();
const callView = new CallView(mediaUtils, peerUtils);
const mediaPreview = new MediaPreview();

// Start media preview
mediaPreview.start();

// Host room
hostBtn.addEventListener('click', async () => {
  const desiredRoomId = hostId.value.trim();
  const peer = peerUtils.createPeer(desiredRoomId);

  peer.on('open', (id) => {
    displayedRoomId.textContent = id;
    connectionInfo.classList.remove('hidden');
    hostBtn.disabled = true;
    joinBtn.disabled = false;
    hostId.disabled = true;
  });

  peer.on('call', async (call) => {
    if (confirm(`Accept call from ${call.peer}?`)) {
      const stream = await mediaUtils.getLocalStream(
        useVideo.checked,
        useAudio.checked
      );
      call.answer(stream);
      peerUtils.handleCall(call,callView);
      setupForm.classList.add('hidden');
    }
  });
});

// Join room
joinBtn.addEventListener('click', async () => {
  const remotePeerId = joinId.value.trim();
  if (!remotePeerId) {
    alert('Please enter a Room ID to join');
    return;
  }

  const peer = peerUtils.createPeer();
  const stream = await mediaUtils.getLocalStream(
    useVideo.checked,
    useAudio.checked
  );

  peer.on('open', () => {
    peerUtils.makeCall(remotePeerId, stream,callView);
    setupForm.classList.add('hidden');
  });
});

// Media controls
useVideo.addEventListener('change', () => {
  mediaUtils.updateStream(peerUtils.currentCall);
  mediaPreview.start();
});

useAudio.addEventListener('change', () => {
  mediaUtils.updateStream(peerUtils.currentCall);
  mediaPreview.start();
});


async function requestPermissions() {
  try {
    await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    console.log("Permissions granted");
    return true;
  } catch (error) {
    if (error.name === 'NotAllowedError') {
      console.error("User denied access to the camera and microphone.");
      alert("Please allow access to the camera and microphone to proceed.");
    } else {
      console.error("An error occurred:", error);
    }
    return false;
  }
}

// Populate the camera dropdown
async function populateCameraDropdown() {
  const devices = await navigator.mediaDevices.enumerateDevices();
  const videoDevices = devices.filter(device => device.kind === 'videoinput');
  const cameraSelect = document.getElementById('select-video');

  videoDevices.forEach((device, index) => {
    const option = document.createElement('option');
    option.value = device.deviceId;
    option.textContent = device.label || `Camera ${index + 1}`;
    cameraSelect.appendChild(option);
  });
}

populateCameraDropdown()