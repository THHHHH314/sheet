// 音高模型：MIDI 音高 <-> 五线谱写法（音名 + 升降 + 八度）之间的换算。
// 全曲范围由 levels.js 决定，这里只做纯计算，方便单元测试。

export const LETTERS = ['C', 'D', 'E', 'F', 'G', 'A', 'B'];

const SEMITONE = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
const NATURAL_OF_PC = { 0: 'C', 2: 'D', 4: 'E', 5: 'F', 7: 'G', 9: 'A', 11: 'B' };
const ACC_OFFSET = { '': 0, '#': 1, b: -1 };

/** 把写法转成 MIDI 音高。{ letter:'F', acc:'#', octave:4 } -> 66 */
export function toMidi({ letter, acc = '', octave }) {
  return (octave + 1) * 12 + SEMITONE[letter] + ACC_OFFSET[acc];
}

/** 该 MIDI 音高是白键吗 */
export function isWhiteKey(midi) {
  return NATURAL_OF_PC[mod12(midi)] !== undefined;
}

/** 白键的本位写法；黑键返回 null */
export function naturalSpelling(midi) {
  const letter = NATURAL_OF_PC[mod12(midi)];
  if (!letter) return null;
  return { letter, acc: '', octave: Math.floor(midi / 12) - 1 };
}

/** [lo, hi] 区间内所有白键的写法，从低到高 */
export function naturalsBetween(lo, hi) {
  const out = [];
  for (let m = lo; m <= hi; m++) {
    const s = naturalSpelling(m);
    if (s) out.push(s);
  }
  return out;
}

/** 黑键的两种写法，用于键盘标签 */
export function blackSpellings(midi) {
  const sharp = naturalSpelling(midi - 1);
  const flat = naturalSpelling(midi + 1);
  return {
    sharp: sharp ? { ...sharp, acc: '#' } : null,
    flat: flat ? { ...flat, acc: 'b' } : null,
  };
}

/** 稳定 id，用于记录每个音的掌握情况 */
export function spellingId({ letter, acc = '', octave }) {
  return `${letter}${acc}${octave}`;
}

/** VexFlow 的音高写法，如 'c/4'（升降号单独作为修饰符添加） */
export function vexKey({ letter, octave }) {
  return `${letter.toLowerCase()}/${octave}`;
}

// ---- 音名 / 唱名 ----

const ACC_TEXT = { '': '', '#': '♯', b: '♭' };

/** 音名：C、F♯4 */
export function letterName({ letter, acc = '', octave }, withOctave = false) {
  return `${letter}${ACC_TEXT[acc]}${withOctave ? octave : ''}`;
}

/** 唱名：do、fa♯。唱名表由 i18n 提供（中文 si / 英文 ti） */
export function solfegeName({ letter, acc = '' }, table) {
  return `${table[letter]}${ACC_TEXT[acc]}`;
}

/**
 * 一行文字形式的标签。
 * @param {object} spelling
 * @param {{mode?:'both'|'letter'|'solfege', solfege:object, withOctave?:boolean, sep?:string}} opts
 */
export function noteLabel(spelling, opts) {
  const { mode = 'both', solfege, withOctave = false, sep = ' · ' } = opts;
  const letter = letterName(spelling, withOctave);
  const sol = solfegeName(spelling, solfege);
  if (mode === 'letter') return letter;
  if (mode === 'solfege') return sol;
  return `${letter}${sep}${sol}`;
}

// ---- 调号 ----
// 显示文字在 i18n 里（keysig.<name>），这里只留乐理数据。

export const KEY_SIGS = {
  C: { vex: 'C', altered: {} },
  G: { vex: 'G', altered: { F: '#' } },
  D: { vex: 'D', altered: { F: '#', C: '#' } },
  F: { vex: 'F', altered: { B: 'b' } },
  Bb: { vex: 'Bb', altered: { B: 'b', E: 'b' } },
};

/**
 * 实际发声的音高：谱面上没写升降号时，调号生效；写了升降号则以写的为准。
 */
export function soundingMidi(spelling, keySigName = 'C') {
  const sig = KEY_SIGS[keySigName] ?? KEY_SIGS.C;
  const acc = spelling.acc || sig.altered[spelling.letter] || '';
  return toMidi({ ...spelling, acc });
}

/** 谱面上是否需要画出升降号（调号里已经有的就不画） */
export function needsAccidentalGlyph(spelling, keySigName = 'C') {
  const sig = KEY_SIGS[keySigName] ?? KEY_SIGS.C;
  if (!spelling.acc) return false;
  return sig.altered[spelling.letter] !== spelling.acc;
}

function mod12(n) {
  return ((n % 12) + 12) % 12;
}
