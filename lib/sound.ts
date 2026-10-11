// Synthesizes soothing study soundscapes and completion chimes using HTML5 Web Audio API.
// 100% offline, zero external sound file downloads.

export type AmbientSoundType = "none" | "rain" | "whitenoise" | "binaural";

let audioCtx: AudioContext | null = null;
let ambientSource: AudioNode | null = null;
let ambientGain: GainNode | null = null;

export function getAudioContext(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!audioCtx) {
    const AudioContextClass =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
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
 * Initializes and unlocks the browser AudioContext on user gesture.
 */
export function initAudio(): void {
  try {
    const ctx = getAudioContext();
    if (ctx && ctx.state === "suspended") {
      void ctx.resume();
    }
  } catch {
    // Ignore audio permission errors
  }
}

/**
 * Plays a warm, melodic completion bell when a Pomodoro focus or break completes.
 */
export function playCompletionChime(): void {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const now = ctx.currentTime;
    const chords = [
      { freq: 523.25, time: 0, dur: 1.2 }, // C5
      { freq: 659.25, time: 0.15, dur: 1.4 }, // E5
      { freq: 783.99, time: 0.3, dur: 1.8 }, // G5
      { freq: 1046.5, time: 0.45, dur: 2.2 }, // C6
    ];

    chords.forEach(({ freq, time, dur }) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = "sine";
      osc.frequency.setValueAtTime(freq, now + time);

      gain.gain.setValueAtTime(0, now + time);
      gain.gain.linearRampToValueAtTime(0.18, now + time + 0.04);
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
 * Starts generating procedurally synthesized focus noise at clear, audible levels.
 */
export function startAmbientSound(type: AmbientSoundType): void {
  stopAmbientSound();
  if (type === "none") return;

  try {
    const ctx = getAudioContext();
    if (!ctx) return;
    if (ctx.state === "suspended") void ctx.resume();

    const gainNode = ctx.createGain();

    if (type === "binaural") {
      // 432Hz deep focus alpha-frequency tone with 10Hz binaural differential
      gainNode.gain.setValueAtTime(0.28, ctx.currentTime);
      gainNode.connect(ctx.destination);
      ambientGain = gainNode;

      const oscLeft = ctx.createOscillator();
      const oscRight = ctx.createOscillator();

      oscLeft.type = "sine";
      oscLeft.frequency.setValueAtTime(432, ctx.currentTime);

      oscRight.type = "sine";
      oscRight.frequency.setValueAtTime(442, ctx.currentTime);

      const merger = ctx.createChannelMerger(2);
      oscLeft.connect(merger, 0, 0);
      oscRight.connect(merger, 0, 1);
      merger.connect(gainNode);

      oscLeft.start();
      oscRight.start();

      ambientSource = merger;
    } else if (type === "rain") {
      // Realistic soothing rainfall: Pink water base + organic raindrop spatters
      gainNode.gain.setValueAtTime(0.5, ctx.currentTime);
      gainNode.connect(ctx.destination);
      ambientGain = gainNode;

      const bufferSize = ctx.sampleRate * 3;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
      for (let i = 0; i < bufferSize; i++) {
        const white = Math.random() * 2 - 1;
        // Paul Kellet's Pink Noise algorithm
        b0 = 0.99886 * b0 + white * 0.0555179;
        b1 = 0.99332 * b1 + white * 0.0750759;
        b2 = 0.96900 * b2 + white * 0.153852;
        b3 = 0.86650 * b3 + white * 0.3104856;
        b4 = 0.55000 * b4 + white * 0.5329522;
        b5 = -0.7616 * b5 - white * 0.016898;
        const pink = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362) * 0.22;
        b6 = white * 0.115926;

        // Occasional organic raindrop patter
        const drop = Math.random() < 0.0035 ? (Math.random() * 0.8 - 0.4) : 0;

        // Gentle volume swell to emulate outdoor breeze
        const swell = 0.88 + 0.12 * Math.sin((i / bufferSize) * Math.PI * 4);

        output[i] = (pink * 0.75 + drop * 0.35) * swell;
      }

      const rainSource = ctx.createBufferSource();
      rainSource.buffer = noiseBuffer;
      rainSource.loop = true;

      // Lowpass filter at 1800Hz removes harsh noise, leaving gentle rain texture
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(1800, ctx.currentTime);

      rainSource.connect(filter);
      filter.connect(gainNode);
      rainSource.start();

      ambientSource = rainSource;
    } else {
      // type === "whitenoise": Pure, steady, soothing white noise (gentle fan/air purifier)
      gainNode.gain.setValueAtTime(0.4, ctx.currentTime);
      gainNode.connect(ctx.destination);
      ambientGain = gainNode;

      const bufferSize = ctx.sampleRate * 2;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);

      for (let i = 0; i < bufferSize; i++) {
        output[i] = (Math.random() * 2 - 1) * 0.45;
      }

      const whiteSource = ctx.createBufferSource();
      whiteSource.buffer = noiseBuffer;
      whiteSource.loop = true;

      // Lowpass at 2800Hz smooths away piercing treble while retaining classic white noise focus
      const filter = ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.setValueAtTime(2800, ctx.currentTime);

      whiteSource.connect(filter);
      filter.connect(gainNode);
      whiteSource.start();

      ambientSource = whiteSource;
    }
  } catch (err) {
    console.warn("Unable to start ambient sound:", err);
  }
}
