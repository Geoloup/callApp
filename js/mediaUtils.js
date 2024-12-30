export class MediaUtils {
  constructor() {
    this.localStream = null;
    this.muteAudioBtn = document.getElementById('mute-audio');
    this.muteVideoBtn = document.getElementById('mute-video');
  }
  
  async getLocalStream(useVideo, useAudio) {
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
    }
    const cameraSelect = document.getElementById('select-video');
    const selectedDeviceId = cameraSelect.value;
  
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
      audio: true
    });
    
    this.localStream = stream;
    return stream;
  }

  async updateStream(currentCall) {
    try {
      const useVideo = document.getElementById('use-video').checked;
      const useAudio = document.getElementById('use-audio').checked;
      const stream = await this.getLocalStream(useVideo, useAudio);
      
      document.getElementById('local-video').srcObject = stream;
      
      if (currentCall?.peerConnection) {
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
}