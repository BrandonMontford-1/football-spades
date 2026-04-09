// services/soundService.js
// expo-av sound effects — programmatically generated, no audio assets needed
// Uses Audio.Sound with oscillator-style base64 encoded minimal WAV tones

import { Audio } from 'expo-av';

// ── Minimal WAV generator ─────────────────────────────────────────────────────
// Generates a PCM WAV tone purely in JS — no files needed, works fully offline

const generateWav = (frequency, durationMs, volume = 0.8, type = 'sine') => {
  const sampleRate  = 22050;
  const numSamples  = Math.floor(sampleRate * durationMs / 1000);
  const numChannels = 1;
  const bitsPerSample = 16;
  const byteRate    = sampleRate * numChannels * bitsPerSample / 8;
  const blockAlign  = numChannels * bitsPerSample / 8;
  const dataSize    = numSamples * blockAlign;
  const bufferSize  = 44 + dataSize;

  const buffer = new ArrayBuffer(bufferSize);
  const view   = new DataView(buffer);

  // WAV header
  const writeStr = (offset, str) => { for (let i = 0; i < str.length; i++) view.setUint8(offset + i, str.charCodeAt(i)); };
  writeStr(0,  'RIFF');
  view.setUint32(4,  bufferSize - 8, true);
  writeStr(8,  'WAVE');
  writeStr(12, 'fmt ');
  view.setUint32(16, 16, true);
  view.setUint16(20, 1,  true); // PCM
  view.setUint16(22, numChannels, true);
  view.setUint32(24, sampleRate, true);
  view.setUint32(28, byteRate, true);
  view.setUint16(32, blockAlign, true);
  view.setUint16(34, bitsPerSample, true);
  writeStr(36, 'data');
  view.setUint32(40, dataSize, true);

  // PCM samples
  const maxVal = 32767 * volume;
  for (let i = 0; i < numSamples; i++) {
    const t = i / sampleRate;
    // Envelope: attack 10ms, decay to 0 by end
    const envelope = Math.min(1, i / (sampleRate * 0.01)) *
                     Math.max(0, 1 - i / numSamples);
    let sample = 0;
    if (type === 'sine') {
      sample = Math.sin(2 * Math.PI * frequency * t);
    } else if (type === 'square') {
      sample = Math.sin(2 * Math.PI * frequency * t) > 0 ? 1 : -1;
    } else if (type === 'sawtooth') {
      sample = 2 * ((frequency * t) % 1) - 1;
    }
    view.setInt16(44 + i * 2, Math.round(sample * envelope * maxVal), true);
  }

  // Convert to base64
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
  return `data:audio/wav;base64,${btoa(binary)}`;
};

// ── Sound definitions ─────────────────────────────────────────────────────────
const SOUND_DEFS = {
  cardPlay:      { freq: 440,  dur: 80,  vol: 0.4, type: 'sine'     }, // soft whoosh-like
  trickWin:      { freq: 523,  dur: 250, vol: 0.7, type: 'sine'     }, // ascending chime C5
  trickWin2:     { freq: 659,  dur: 200, vol: 0.7, type: 'sine'     }, // E5 chord follow
  trickLose:     { freq: 220,  dur: 200, vol: 0.5, type: 'sawtooth' }, // low thud
  spadesBroken:  { freq: 330,  dur: 300, vol: 0.8, type: 'square'   }, // dramatic sting
  bidPlaced:     { freq: 392,  dur: 100, vol: 0.4, type: 'sine'     }, // soft G4 click
  gameWin:       { freq: 784,  dur: 400, vol: 0.9, type: 'sine'     }, // high fanfare G5
  gameWin2:      { freq: 988,  dur: 350, vol: 0.9, type: 'sine'     }, // B5 resolve
  gameLose:      { freq: 165,  dur: 500, vol: 0.7, type: 'sawtooth' }, // low drone
  autoPlay:      { freq: 277,  dur: 200, vol: 0.6, type: 'square'   }, // warning beep
  clockWarning:  { freq: 440,  dur: 100, vol: 0.5, type: 'square'   }, // tick
  pause:         { freq: 350,  dur: 150, vol: 0.4, type: 'sine'     }, // soft pause tone
  resume:        { freq: 523,  dur: 150, vol: 0.4, type: 'sine'     }, // soft resume tone
};

// ── Sound cache ───────────────────────────────────────────────────────────────
let soundCache = {};
let audioMode  = false;
let initialized = false;

const init = async () => {
  if (initialized) return;
  try {
    await Audio.setAudioModeAsync({
      playsInSilentModeIOS: true,
      staysActiveInBackground: false,
      shouldDuckAndroid: true,
    });
    initialized = true;
  } catch (e) {
    console.log('Audio init error:', e);
  }
};

const loadSound = async (key) => {
  if (soundCache[key]) return soundCache[key];
  try {
    const def = SOUND_DEFS[key];
    if (!def) return null;
    const uri = generateWav(def.freq, def.dur, def.vol, def.type);
    const { sound } = await Audio.Sound.createAsync({ uri });
    soundCache[key] = sound;
    return sound;
  } catch (e) {
    return null;
  }
};

const play = async (key) => {
  try {
    await init();
    const sound = await loadSound(key);
    if (!sound) return;
    await sound.setPositionAsync(0);
    await sound.playAsync();
  } catch (_) {}
};

// ── Public API ────────────────────────────────────────────────────────────────
export const SoundService = {
  init,

  cardPlay:     () => play('cardPlay'),

  trickWin:     async () => {
    await play('trickWin');
    setTimeout(() => play('trickWin2'), 150);
  },

  trickLose:    () => play('trickLose'),

  spadesBroken: () => play('spadesBroken'),

  bidPlaced:    () => play('bidPlaced'),

  gameWin:      async () => {
    await play('gameWin');
    setTimeout(() => play('gameWin2'), 300);
  },

  gameLose:     () => play('gameLose'),

  autoPlay:     () => play('autoPlay'),

  clockWarning: () => play('clockWarning'),

  pause:        () => play('pause'),

  resume:       () => play('resume'),

  // Unload all sounds (call on unmount)
  unloadAll: async () => {
    for (const key of Object.keys(soundCache)) {
      try { await soundCache[key].unloadAsync(); } catch (_) {}
    }
    soundCache = {};
    initialized = false;
  },
};

export default SoundService;
