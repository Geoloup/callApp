export class PeerUtils {
  constructor() {
    this.peer = null;
    this.currentCall = null;
  }

  createPeer(peerId = '') {
    this.peer = new Peer(peerId || undefined);
    return this.peer;
  }

  async makeCall(remotePeerId, localStream, show) {
    if (!remotePeerId.trim()) {
      alert('Please enter a Room ID to call');
      return;
    }

    try {
      const call = this.peer.call(remotePeerId, localStream);
      this.handleCall(call, show);
    } catch (err) {
      console.error('Failed to make call:', err);
      alert(
        'Failed to make call. Please check your camera/microphone permissions.'
      );
    }
  }

  handleCall(call, CallView) {
    this.currentCall = call;
    if (!document.getElementById('use-video').checked) {
      CallView.muteVideoBtn.click()
    }
    if (!document.getElementById('use-audio').checked) {
      CallView.muteAudioBtn.click()
      console.log('muting')
    }
    call.on('stream', (remoteStream) => {
      document.getElementById('remote-video').srcObject = remoteStream;
      CallView.show();
    });

    call.on('close', () => {
      document.getElementById('remote-video').srcObject = null;
    });

    call.on('error', (err) => {
      console.error('Call error:', err);
      document.getElementById('remote-video').srcObject = null;
    });
  }
}
