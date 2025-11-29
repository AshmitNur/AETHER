export function decodeBase64(base64: string): Uint8Array {
  const binaryString = atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes;
}

export async function playPcmAudio(base64Audio: string, onEnded?: () => void): Promise<() => void> {
  try {
    const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)({
      sampleRate: 24000, 
    });

    const pcmData = decodeBase64(base64Audio);
    
    // Create an Int16Array from the Uint8Array
    const int16Data = new Int16Array(pcmData.buffer);
    
    // Create AudioBuffer
    const audioBuffer = audioContext.createBuffer(1, int16Data.length, 24000);
    const channelData = audioBuffer.getChannelData(0);

    // Convert Int16 to Float32
    for (let i = 0; i < int16Data.length; i++) {
      channelData[i] = int16Data[i] / 32768.0;
    }

    const source = audioContext.createBufferSource();
    source.buffer = audioBuffer;
    source.connect(audioContext.destination);

    source.onended = () => {
      audioContext.close();
      if (onEnded) onEnded();
    };

    source.start();

    // Return a function to stop the audio manually
    return () => {
      try {
        source.stop();
        audioContext.close();
      } catch (e) {
        // Ignore errors if already stopped/closed
      }
    };
  } catch (e) {
    console.error("Error playing audio:", e);
    return () => {};
  }
}

export function float32ToInt16(float32Array: Float32Array): Int16Array {
  const int16Array = new Int16Array(float32Array.length);
  for (let i = 0; i < float32Array.length; i++) {
    const s = Math.max(-1, Math.min(1, float32Array[i]));
    int16Array[i] = s < 0 ? s * 0x8000 : s * 0x7FFF;
  }
  return int16Array;
}

export function arrayBufferToBase64(buffer: ArrayBuffer): string {
  let binary = '';
  const bytes = new Uint8Array(buffer);
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}