// Synthesizes soothing study soundscapes and completion chimes using HTML5 Web Audio API.
// 100% offline, zero external sound file downloads.

export type AmbientSoundType = "none" | "rain" | "whitenoise" | "binaural";

let audioCtx: AudioContext | null = null;
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;
let ambientTimer: number | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === "suspended") {
    void audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Plays a warm, melodic completion bell when a Pomodoro focus or break completes.
 */
export function playCompletionChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const now = ctx.currentTime;
    const chords = [
      { freq: 523.25, time: 0, dur: 1.2 },     // C5
      { freq: 659.25, time: 0.15, dur: 1.4 },  // E5
      { freq: 783.99, time: 0.3, dur: 1.8 },   // G5
      { freq: 1046.50, time: 0.45, dur: 2.2 }, // C6
    ];

    chords.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.12, now + time + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + time + dur);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + time);
      osc.stop(now + time + dur);
    });
  } catch (err) {
    console.warn("Unable to play completion chime:", err);
  }
}

/**
 * Stops any playing ambient background noise.
 */
export function stopAmbientSound(): void {
  try {
    if (ambientTimer) {
      window.clearInterval(ambientTimer);
      ambientTimer = null;
    }
    if (ambientSource) {
      try {
        (ambientSource as AudioBufferSourceNode).stop?.();
      } catch {
        // ignore if already stopped
      }
      ambientSource.disconnect();
      ambientSource = null;
    }
    if (ambientGain) {
      ambientGain.disconnect();
      ambientGain = null;
    }
  } catch {
    // Ignore cleanup issues
  }
}

/**
 * Starts generating procedurally synthesized focus noise.
 */
export function startAmbientSound(type: AmbientSoundType, volume = 0.3): void {
  stopAmbientSound();
  if (type === "none") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(Math.max(0.01, Math.min(1, volume)), ctx.currentTime);
    gainNode.connect(ctx.destination);
    ambientGain = gainNode;

    if (type === "binaural") {
      // 432Hz deep focus alpha-frequency tone with binaural modulation
      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();

      oscLeft.type = "sine";
      oscLeft.frequency.setValueAtTime(432, ctx.currentTime);

      oscRight.type = "sine";
      oscRight.frequency.setValueAtTime(442, ctx.currentTime); // 10Hz alpha differential

      const merger = ctx.createChannelMerger(2);
      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(gainNode);

      oscLeft.start();
      oscRight.start();

      ambientSource = merger;
    } else {
      // Generate noise buffer (2 seconds loop)
      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        if (type === "rain") {
          // Pink-filtered noise for soothing rain effect
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          output[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.08;
          b6 = white * 0.115926;
        } else {
          // Standard soft white noise
          output[i] = white * 0.12;
        }
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      // Filter to take away harsh high frequencies
      const filter = ctx.createBiquadFilter();
      filter.type = type === "rain" ? "lowpass" : "bandpass";
      filter.frequency.setValueAtTime(type === "rain" ? 850 : 1200, ctx.currentTime);

      whiteNoise.connect(filter);
      filter.connect(gainNode);
      whiteNoise.start();

      ambientSource = whiteNoise;
    }
  } catch (err) {
    console.warn("Unable to start ambient sound:", err);
  }
}

/**
 * Adjusts ambient sound volume while playing.
 */
export function setAmbientVolume(volume: number): void {
  if (ambientGain && audioCtx) {
    const val = Math.max(0, Math.min(1, volume));
    ambientGain.gain.setValueAtTime(val, audioCtx.currentTime);
  }
}
