export class AudioVisualizer {
  constructor(canvasId, stream, label) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.audioCtx = new AudioContext();
    this.analyser = this.audioCtx.createAnalyser();
    this.label = label;

    // Connect audio stream
    try {
      const source = this.audioCtx.createMediaStreamSource(stream);
      source.connect(this.analyser);

      this.analyser.fftSize = 256;
      this.bufferLength = this.analyser.frequencyBinCount;
      this.dataArray = new Uint8Array(this.bufferLength);

      this.draw = this.draw.bind(this);
      this.draw();
    } catch {
      console.warn('no sound stream was found');
    }
  }

  draw() {
    const { ctx, canvas, analyser, dataArray, bufferLength } = this;
    const width = canvas.width;
    const height = canvas.height;

    // Clear canvas
    ctx.fillStyle = 'rgb(26, 26, 26)';
    ctx.fillRect(0, 0, width, height);

    // Get audio data
    analyser.getByteFrequencyData(dataArray);

    const barWidth = (width / bufferLength) * 2.5;
    let barHeight;
    let x = 0;

    // Draw bars
    for (let i = 0; i < bufferLength; i++) {
      barHeight = (dataArray[i] / 255) * height;

      const hue = (i / bufferLength) * 360;
      ctx.fillStyle = `hsl(${hue}, 100%, 50%)`;

      ctx.fillRect(x, height - barHeight, barWidth, barHeight);
      x += barWidth + 1;
    }

    requestAnimationFrame(this.draw);
  }

  destroy() {
    this.audioCtx.close();
  }
}
