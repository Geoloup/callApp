export class MediaPreview {
  constructor() {
    this.previewContainer = document.getElementById('media-preview');
    this.videoPreview = document.getElementById('preview-video');
    this.localVideo = document.getElementById("local-video");
    this.audioMeter = document.getElementById('audio-meter');
    this.audioContext = null;
    this.analyser = null;
    this.dataArray = null;
    this.animationFrame = null;
  }

  async start() {
    try {
      const cameraSelect = document.getElementById('select-video');
      const selectedDeviceId = cameraSelect.value;
    
    
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined },
        audio: true
      });

      // Set up video preview
      this.videoPreview.srcObject = stream;
      //this.localVideo.srcObject = stream;

      // Set up audio meter
      if (stream.getAudioTracks().length > 0) {
        this.setupAudioMeter(stream);
      }
    } catch (err) {
      console.error('Error accessing media devices:', err);
    }
  }

  setupAudioMeter(stream) {
    this.audioContext = new AudioContext();
    this.analyser = this.audioContext.createAnalyser();
    const source = this.audioContext.createMediaStreamSource(stream);
    source.connect(this.analyser);

    this.analyser.fftSize = 32;
    this.dataArray = new Uint8Array(this.analyser.frequencyBinCount);
    this.updateAudioMeter();
  }

  updateAudioMeter() {
    if (!this.analyser) return;

    this.analyser.getByteFrequencyData(this.dataArray);
    const average =
      this.dataArray.reduce((a, b) => a + b) / this.dataArray.length;
    const level = Math.min(average / 128, 1);

    // Calculate color based on level
    const hue = 120 - level * 120; // Green to red
    this.audioMeter.style.height = `${level * 100}%`;
    this.audioMeter.style.backgroundColor = `hsl(${hue}, 100%, 50%)`;

    this.animationFrame = requestAnimationFrame(() => this.updateAudioMeter());
  }

  stop() {
    if (this.videoPreview.srcObject) {
      this.videoPreview.srcObject.getTracks().forEach((track) => track.stop());
    }
    if (this.audioContext) {
      this.audioContext.close();
    }
    if (this.animationFrame) {
      cancelAnimationFrame(this.animationFrame);
    }
  }
}
