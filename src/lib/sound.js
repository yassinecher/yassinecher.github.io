// The room's few sounds, synthesised in the browser (no audio files): a guitar strum, the TV
// switching off and on. Quiet on purpose. Browsers only allow audio after the visitor has
// clicked or pressed a key somewhere, so until then these stay silent.

let context = null;
const audio = () => {
  if (typeof window === "undefined" || !window.AudioContext) return null;
  context ??= new AudioContext();
  if (context.state === "suspended") context.resume().catch(() => {});
  return context.state === "running" ? context : null;
};

// Unlock on the first real gesture, so a later hover can play
if (typeof window !== "undefined") {
  const unlock = () => {
    audio();
    window.removeEventListener("pointerdown", unlock);
    window.removeEventListener("keydown", unlock);
  };
  window.addEventListener("pointerdown", unlock);
  window.addEventListener("keydown", unlock);
}

// A plucked string (Karplus-Strong): a burst of noise through a short, decaying delay line.
// Rendered once per note and kept.
const strings = new Map();
const pluck = (ctx, frequency) => {
  if (strings.has(frequency)) return strings.get(frequency);
  const rate = ctx.sampleRate;
  const period = Math.round(rate / frequency);
  const buffer = ctx.createBuffer(1, Math.round(rate * 2.4), rate);
  const out = buffer.getChannelData(0);
  const ring = new Float32Array(period).map(() => Math.random() * 2 - 1);
  for (let n = 0; n < out.length; n++) {
    const i = n % period;
    const value = ring[i];
    out[n] = value;
    ring[i] = 0.4985 * (value + ring[(i + 1) % period]);
  }
  strings.set(frequency, buffer);
  return buffer;
};

// E minor, open strings, strummed down
const CHORD = [82.41, 123.47, 164.81, 196.0, 246.94, 329.63];
let lastStrum = 0;
export const strum = () => {
  const ctx = audio();
  const now = performance.now();
  if (!ctx || now - lastStrum < 1200) return false;
  lastStrum = now;
  const tone = ctx.createBiquadFilter();
  tone.type = "lowpass";
  tone.frequency.value = 3200;
  const volume = ctx.createGain();
  volume.gain.value = 0.16;
  tone.connect(volume).connect(ctx.destination);
  CHORD.forEach((frequency, i) => {
    const source = ctx.createBufferSource();
    source.buffer = pluck(ctx, frequency);
    const gain = ctx.createGain();
    gain.gain.value = 0.55 + i * 0.05;
    source.connect(gain).connect(tone);
    source.start(ctx.currentTime + i * 0.022);
  });
  return true;
};

// The TV: a soft click, and on power-off the fading whine of an old tube
export const tvSound = (on) => {
  const ctx = audio();
  if (!ctx) return;
  const t = ctx.currentTime;
  const click = ctx.createBufferSource();
  const noise = ctx.createBuffer(1, Math.round(ctx.sampleRate * 0.03), ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length) ** 3;
  click.buffer = noise;
  const clickGain = ctx.createGain();
  clickGain.gain.value = 0.12;
  click.connect(clickGain).connect(ctx.destination);
  click.start(t);
  const whine = ctx.createOscillator();
  whine.frequency.setValueAtTime(on ? 7000 : 15000, t);
  whine.frequency.exponentialRampToValueAtTime(on ? 15000 : 4000, t + 0.4);
  const whineGain = ctx.createGain();
  whineGain.gain.setValueAtTime(0.0001, t);
  whineGain.gain.exponentialRampToValueAtTime(0.012, t + 0.03);
  whineGain.gain.exponentialRampToValueAtTime(0.0001, t + 0.45);
  whine.connect(whineGain).connect(ctx.destination);
  whine.start(t);
  whine.stop(t + 0.5);
};
