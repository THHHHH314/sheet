// 屏幕钢琴键盘。触屏优先：pointerdown 立即响应，不等 click，
// 避免 iPad 上 300ms 延迟和双击缩放。
import {
  naturalsBetween, toMidi, blackSpellings, naturalSpelling,
  letterName, solfegeName, noteLabel,
} from './notes.js';

const BLACK_WIDTH_RATIO = 0.62;

export class Keyboard {
  constructor(host) {
    this.host = host;
    this.keys = new Map(); // midi -> element
    this.onPress = null;
    this.locked = false;
    this.blackEnabled = true;
    this.host.addEventListener('pointerdown', (e) => this.handlePointer(e));
    this.host.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  /**
   * @param {{lo:number, hi:number, blackEnabled:boolean, showNames:boolean,
   *          labelMode:'both'|'letter'|'solfege', solfege:object}} cfg
   */
  render(cfg) {
    const { lo, hi, blackEnabled, showNames, labelMode, solfege } = cfg;
    this.blackEnabled = blackEnabled;
    this.keys.clear();
    this.host.innerHTML = '';

    const whites = naturalsBetween(lo, hi);
    const n = whites.length;
    const whitePct = 100 / n;
    const blackPct = whitePct * BLACK_WIDTH_RATIO;

    whites.forEach((spelling, i) => {
      const midi = toMidi(spelling);
      const el = document.createElement('button');
      el.className = i === n - 1 ? 'key key--white key--edge' : 'key key--white';
      el.type = 'button';
      el.style.left = `${i * whitePct}%`;
      el.style.width = `${whitePct}%`;
      el.dataset.midi = String(midi);
      el.setAttribute(
        'aria-label',
        noteLabel(spelling, { mode: labelMode, solfege, withOctave: true })
      );
      if (showNames) el.appendChild(keyLabel(spelling, labelMode, solfege));
      this.host.appendChild(el);
      this.keys.set(midi, el);
    });

    // 黑键：夹在相邻两个白键（相差全音）之间
    for (let i = 0; i < n - 1; i++) {
      const lowMidi = toMidi(whites[i]);
      if (toMidi(whites[i + 1]) - lowMidi !== 2) continue;
      const midi = lowMidi + 1;
      const el = document.createElement('button');
      el.className = `key key--black${blackEnabled ? '' : ' key--muted'}`;
      el.type = 'button';
      el.style.left = `${(i + 1) * whitePct - blackPct / 2}%`;
      el.style.width = `${blackPct}%`;
      el.dataset.midi = String(midi);
      const { sharp, flat } = blackSpellings(midi);
      el.setAttribute(
        'aria-label',
        [sharp, flat]
          .filter(Boolean)
          .map((sp) => noteLabel(sp, { mode: labelMode, solfege, withOctave: true }))
          .join(' / ')
      );
      this.host.appendChild(el);
      this.keys.set(midi, el);
    }
  }

  handlePointer(e) {
    const el = e.target.closest('.key');
    if (!el) return;
    e.preventDefault();
    const midi = Number(el.dataset.midi);
    if (this.locked) return;
    if (!this.blackEnabled && !naturalSpelling(midi)) {
      flash(el, 'key--nudge', 320);
      return;
    }
    flash(el, 'key--active', 180);
    this.onPress?.(midi, el);
  }

  mark(midi, state) {
    const el = this.keys.get(midi);
    if (el) el.classList.add(`key--${state}`);
  }

  clearMarks() {
    for (const el of this.keys.values()) {
      el.classList.remove('key--correct', 'key--wrong', 'key--hint', 'key--active', 'key--nudge');
    }
  }

  setLocked(v) {
    this.locked = v;
  }
}

/** 键面标签：音名一行、唱名一行（只选一种时就一行） */
function keyLabel(spelling, labelMode, solfege) {
  const wrap = document.createElement('span');
  wrap.className = 'key__label';
  if (labelMode !== 'solfege') {
    const a = document.createElement('span');
    a.className = 'key__letter';
    a.textContent = letterName(spelling);
    wrap.appendChild(a);
  }
  if (labelMode !== 'letter') {
    const b = document.createElement('span');
    b.className = 'key__solfege';
    b.textContent = solfegeName(spelling, solfege);
    wrap.appendChild(b);
  }
  return wrap;
}

function flash(el, cls, ms) {
  el.classList.add(cls);
  setTimeout(() => el.classList.remove(cls), ms);
}
