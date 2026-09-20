// 极简合成器：不下载采样，体积小、iPad 上离线可用。
// iOS 要求首次用户手势里才能启动 AudioContext。
let ctx = null;
let enabled = true;

export function setEnabled(v) {
  enabled = v;
}

export function unlock() {
  if (ctx) return;
  const AC = window.AudioContext || window.webkitAudioContext;
  if (!AC) return;
  ctx = new AC();
  // iOS 上需要一次空播放来真正解锁
  const buf = ctx.createBuffer(1, 1, 22050);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  src.connect(ctx.destination);
  src.start(0);
}

const freq = (midi) => 440 * Math.pow(2, (midi - 69) / 12);

export function playNote(midi, { duration = 0.9, gain = 0.22, delay = 0 } = {}) {
  if (!enabled || !ctx) return;
  if (ctx.state === 'suspended') ctx.resume();
  const t0 = ctx.currentTime + delay;
  const out = ctx.createGain();
  out.connect(ctx.destination);
  out.gain.setValueAtTime(0, t0);
  out.gain.linearRampToValueAtTime(gain, t0 + 0.012);
  out.gain.exponentialRampToValueAtTime(0.0001, t0 + duration);

  // 基音 + 两个泛音，听起来接近钢琴
  const partials = [
    { type: 'triangle', mult: 1, level: 1 },
    { type: 'sine', mult: 2, level: 0.32 },
    { type: 'sine', mult: 3, level: 0.12 },
  ];
  for (const p of partials) {
    const osc = ctx.createOscillator();
    const g = ctx.createGain();
    osc.type = p.type;
    osc.frequency.value = freq(midi) * p.mult;
    g.gain.value = p.level;
    osc.connect(g).connect(out);
    osc.start(t0);
    osc.stop(t0 + duration + 0.05);
  }
}

export function playCorrect() {
  if (!enabled || !ctx) return;
  [76, 81, 88].forEach((m, i) => playNote(m, { duration: 0.5, gain: 0.14, delay: i * 0.07 }));
}

export function playWrong() {
  if (!enabled || !ctx) return;
  playNote(47, { duration: 0.26, gain: 0.12 });
  playNote(48, { duration: 0.26, gain: 0.1, delay: 0.01 });
}

export function playLevelUp() {
  if (!enabled || !ctx) return;
  [72, 76, 79, 84].forEach((m, i) => playNote(m, { duration: 0.7, gain: 0.16, delay: i * 0.1 }));
}
