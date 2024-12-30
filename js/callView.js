import { AudioVisualizer } from './audioVisualizer.js';

export class CallView {
  constructor(mediaUtils, peerUtils) {
    this.mediaUtils = mediaUtils;
    this.peerUtils = peerUtils;

    this.container = document.getElementById('call-container');
    this.localVideo = document.getElementById('local-video');
    this.remoteVideo = document.getElementById('remote-video');
    this.muteAudioBtn = document.getElementById('mute-audio');
    this.muteVideoBtn = document.getElementById('mute-video');
    this.endCallBtn = document.getElementById('end-call-btn');
    this.rotateothervideo = document.getElementById('rotateothervideo');

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.muteAudioBtn.addEventListener('click', () => {
      const tracks = this.mediaUtils.localStream?.getAudioTracks();
      if (tracks && tracks.length > 0) {
        tracks.forEach((track) => (track.enabled = !track.enabled));
        this.muteAudioBtn.classList.toggle('muted');
        this.muteAudioBtn.classList.toggle('bx-microphone-off');
      } else {
        console.warn('No audio tracks available to mute/unmute.');
      }
    });

    this.muteVideoBtn.addEventListener('click', () => {
      const tracks = this.mediaUtils.localStream?.getVideoTracks();
      if (tracks && tracks.length > 0) {
        tracks.forEach((track) => (track.enabled = !track.enabled));
        this.muteVideoBtn.classList.toggle('muted');
        this.muteVideoBtn.classList.toggle('bx-video-off');
      } else {
        console.warn('No video tracks available to mute/unmute.');
      }
    });

    this.rotateothervideo.addEventListener('input', () => {
      this.remoteVideo.style.transform = "rotate(" + this.rotateothervideo.value + "deg) rotateY(180deg)"
    });

    this.endCallBtn.addEventListener('click', () => {
      console.log('Ending the call...');
      this.hide();
      // Add logic to end the call using peerUtils
      location.reload();
    });

  }

  setupAudioVisualizers() {
    if (this.mediaUtils.localStream) {
      new AudioVisualizer(
        'local-audio-canvas',
        this.mediaUtils.localStream,
        'Your Audio'
      );
    } else {
      console.warn('No local stream available for audio visualization.');
    }

    this.localVideo.srcObject = this.mediaUtils.localStream;
    const remoteStream = this.remoteVideo.srcObject;
    console.log(remoteStream);
    if (remoteStream) {
      try {
        new AudioVisualizer(
          'remote-audio-canvas',
          remoteStream,
          'Remote Audio'
        );
      } catch {}
    } else {
      console.warn('No remote stream available for audio visualization.');
    }
  }

  show() {
    this.container.classList.remove('hidden');
    this.setupAudioVisualizers();
  }

  hide() {
    this.container.classList.add('hidden');
  }
}
