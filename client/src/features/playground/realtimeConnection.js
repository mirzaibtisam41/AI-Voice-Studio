const REALTIME_CALLS_URL = 'https://api.openai.com/v1/realtime/calls';
const CONNECT_TIMEOUT_MS = 15000;

function waitForConnection(peer) {
  return new Promise((resolve, reject) => {
    if (peer.connectionState === 'connected') {
      resolve();
      return;
    }

    const timer = setTimeout(() => {
      cleanup();
      reject(new Error('The voice service did not answer in time'));
    }, CONNECT_TIMEOUT_MS);

    const handleChange = () => {
      if (peer.connectionState === 'connected') {
        cleanup();
        resolve();
      } else if (
        peer.connectionState === 'failed' ||
        peer.connectionState === 'closed'
      ) {
        cleanup();
        reject(new Error('The voice connection failed'));
      }
    };

    function cleanup() {
      clearTimeout(timer);
      peer.removeEventListener('connectionstatechange', handleChange);
    }

    peer.addEventListener('connectionstatechange', handleChange);
  });
}

export async function readRoundTripMs(peer) {
  const stats = await peer.getStats();
  let roundTrip = null;

  stats.forEach((report) => {
    if (
      report.type === 'candidate-pair' &&
      report.state === 'succeeded' &&
      report.nominated &&
      typeof report.currentRoundTripTime === 'number'
    ) {
      roundTrip = Math.round(report.currentRoundTripTime * 1000);
    }
  });

  return roundTrip;
}

export async function connectRealtime({
  clientSecret,
  stream,
  audioElement,
  onEvent,
  onDisconnect,
}) {
  const peer = new RTCPeerConnection();
  let closed = false;

  const close = () => {
    if (closed) return;
    closed = true;
    peer.getSenders().forEach((sender) => sender.track?.stop());
    peer.close();
    if (audioElement) audioElement.srcObject = null;
  };

  try {
    peer.ontrack = (event) => {
      if (audioElement) audioElement.srcObject = event.streams[0];
    };

    stream.getAudioTracks().forEach((track) => peer.addTrack(track, stream));

    const channel = peer.createDataChannel('oai-events');

    channel.addEventListener('message', (event) => {
      try {
        onEvent(JSON.parse(event.data));
      } catch {
        return;
      }
    });

    const offer = await peer.createOffer();

    await peer.setLocalDescription(offer);

    const response = await fetch(REALTIME_CALLS_URL, {
      method: 'POST',
      body: offer.sdp,
      headers: {
        Authorization: `Bearer ${clientSecret}`,
        'Content-Type': 'application/sdp',
      },
    });

    if (!response.ok) {
      throw new Error(
        `The voice service refused the call (${response.status})`,
      );
    }

    await peer.setRemoteDescription({
      type: 'answer',
      sdp: await response.text(),
    });
    await waitForConnection(peer);

    peer.addEventListener('connectionstatechange', () => {
      if (!closed && peer.connectionState === 'failed') {
        onDisconnect?.();
      }
    });

    return { peer, channel, close };
  } catch (error) {
    close();
    throw error;
  }
}
