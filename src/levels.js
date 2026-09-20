// 难度阶梯。总音域：C3（低音谱表第二间）～ E5（高音谱表第四间）。
// 改音域只需要动这两个常量和对应关卡的 lo/hi。
import { naturalsBetween, toMidi, naturalSpelling } from './notes.js';

export const RANGE_LO = toMidi({ letter: 'C', octave: 3 }); // 48
export const RANGE_HI = toMidi({ letter: 'E', octave: 5 }); // 76

const N = (letter, octave) => toMidi({ letter, octave });

/**
 * 关卡名和提示文字在 i18n 里（level.<id>.name / level.<id>.hint）。
 * tier: 'starter' | 'middle' | 'advanced'
 * staff: 'treble' | 'bass' | 'grand' —— 画哪个谱表
 * lo/hi: 出题音域（白键端点）
 * kbLo/kbHi: 屏幕键盘显示的音域，比出题音域略宽，避免"只有正确答案可按"
 * accidentals: 是否出升降号（中级才开）
 * keySigs: 可能出现的调号
 */
export const LEVELS = [
  {
    id: 1, tier: 'starter',
    staff: 'treble', lo: N('C', 4), hi: N('E', 4),
    kbLo: N('C', 4), kbHi: N('G', 4),
    accidentals: false, keySigs: ['C'], showNames: true,
  },
  {
    id: 2, tier: 'starter',
    staff: 'treble', lo: N('C', 4), hi: N('C', 5),
    kbLo: N('C', 4), kbHi: N('C', 5),
    accidentals: false, keySigs: ['C'], showNames: true,
  },
  {
    id: 3, tier: 'starter',
    staff: 'treble', lo: N('C', 4), hi: N('E', 5),
    kbLo: N('C', 4), kbHi: N('E', 5),
    accidentals: false, keySigs: ['C'], showNames: false,
  },
  {
    id: 4, tier: 'starter',
    staff: 'bass', lo: N('G', 3), hi: N('C', 4),
    kbLo: N('F', 3), kbHi: N('C', 4),
    accidentals: false, keySigs: ['C'], showNames: true,
  },
  {
    id: 5, tier: 'starter',
    staff: 'bass', lo: N('C', 3), hi: N('C', 4),
    kbLo: N('C', 3), kbHi: N('C', 4),
    accidentals: false, keySigs: ['C'], showNames: false,
  },
  {
    id: 6, tier: 'middle',
    staff: 'grand', lo: RANGE_LO, hi: RANGE_HI,
    kbLo: RANGE_LO, kbHi: RANGE_HI,
    accidentals: false, keySigs: ['C'], showNames: false,
  },
  {
    id: 7, tier: 'middle',
    staff: 'grand', lo: RANGE_LO, hi: RANGE_HI,
    kbLo: RANGE_LO, kbHi: RANGE_HI,
    accidentals: true, keySigs: ['C'], showNames: false,
  },
  {
    id: 8, tier: 'advanced',
    staff: 'grand', lo: RANGE_LO, hi: RANGE_HI,
    kbLo: RANGE_LO, kbHi: RANGE_HI,
    accidentals: true, keySigs: ['G', 'F', 'D', 'Bb'], showNames: false,
  },
];

export const ROUND_SIZE = 20;
export const PASS_ACCURACY = 0.85; // 达到这个正确率解锁下一关

export function levelById(id) {
  return LEVELS.find((l) => l.id === id) ?? LEVELS[0];
}

/**
 * 关卡的出题池。本位音直接取白键；开了 accidentals 再加上
 * 落在黑键上的升降写法（只取 C#/D#/F#/G#/A# 与 Db/Eb/Gb/Ab/Bb，
 * 避开 E♯、F♭ 这类孩子暂时不需要的写法）。
 */
export function poolFor(level) {
  const pool = naturalsBetween(level.lo, level.hi);
  if (!level.accidentals) return pool;

  const extra = [];
  for (const nat of pool) {
    const base = toMidi(nat);
    for (const acc of ['#', 'b']) {
      const midi = acc === '#' ? base + 1 : base - 1;
      if (midi < level.lo || midi > level.hi) continue;
      if (naturalSpelling(midi)) continue; // 结果必须落在黑键上
      extra.push({ ...nat, acc });
    }
  }
  return pool.concat(extra);
}
