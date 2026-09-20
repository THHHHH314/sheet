import test from 'node:test';
import assert from 'node:assert/strict';
import {
  toMidi, naturalSpelling, naturalsBetween, blackSpellings, spellingId, vexKey,
  letterName, solfegeName, noteLabel, soundingMidi, needsAccidentalGlyph, isWhiteKey,
} from '../src/notes.js';
import { SOLFEGE } from '../src/i18n.js';

test('音名 -> MIDI', () => {
  assert.equal(toMidi({ letter: 'C', octave: 4 }), 60);
  assert.equal(toMidi({ letter: 'C', octave: 3 }), 48);
  assert.equal(toMidi({ letter: 'E', octave: 5 }), 76);
  assert.equal(toMidi({ letter: 'F', acc: '#', octave: 4 }), 66);
  assert.equal(toMidi({ letter: 'G', acc: 'b', octave: 4 }), 66);
  assert.equal(toMidi({ letter: 'A', octave: 4 }), 69);
});

test('白键写法，黑键返回 null', () => {
  assert.deepEqual(naturalSpelling(60), { letter: 'C', acc: '', octave: 4 });
  assert.equal(naturalSpelling(61), null);
  assert.equal(isWhiteKey(60), true);
  assert.equal(isWhiteKey(61), false);
});

test('C3–E5 共 17 个白键，首尾正确', () => {
  const whites = naturalsBetween(48, 76);
  assert.equal(whites.length, 17);
  assert.equal(spellingId(whites[0]), 'C3');
  assert.equal(spellingId(whites.at(-1)), 'E5');
  // 每个白键都能还原成原来的音高
  for (const s of whites) assert.equal(isWhiteKey(toMidi(s)), true);
});

test('黑键的两种写法', () => {
  const { sharp, flat } = blackSpellings(61);
  assert.equal(spellingId(sharp), 'C#4');
  assert.equal(spellingId(flat), 'Db4');
  assert.equal(toMidi(sharp), 61);
  assert.equal(toMidi(flat), 61);
});

test('VexFlow 音高写法', () => {
  assert.equal(vexKey({ letter: 'C', octave: 4 }), 'c/4');
  assert.equal(vexKey({ letter: 'F', acc: '#', octave: 5 }), 'f/5');
});

test('音名 / 唱名标签', () => {
  const c4 = { letter: 'C', acc: '', octave: 4 };
  const fs4 = { letter: 'F', acc: '#', octave: 4 };
  assert.equal(letterName(c4), 'C');
  assert.equal(letterName(c4, true), 'C4');
  assert.equal(letterName(fs4, true), 'F♯4');
  assert.equal(solfegeName(c4, SOLFEGE.zh), 'do');
  // 中文用 si，英文用 ti
  assert.equal(solfegeName({ letter: 'B', acc: '' }, SOLFEGE.zh), 'si');
  assert.equal(solfegeName({ letter: 'B', acc: '' }, SOLFEGE.en), 'ti');

  const opts = { solfege: SOLFEGE.zh, withOctave: true };
  assert.equal(noteLabel(c4, { ...opts, mode: 'both' }), 'C4 · do');
  assert.equal(noteLabel(c4, { ...opts, mode: 'letter' }), 'C4');
  assert.equal(noteLabel(c4, { ...opts, mode: 'solfege' }), 'do');
  assert.equal(noteLabel(fs4, { ...opts, mode: 'both' }), 'F♯4 · fa♯');
});

test('调号决定实际发声的音高', () => {
  const f4 = { letter: 'F', acc: '', octave: 4 };
  const b4 = { letter: 'B', acc: '', octave: 4 };
  assert.equal(soundingMidi(f4, 'C'), 65);
  assert.equal(soundingMidi(f4, 'G'), 66, 'G 大调的 F 要升');
  assert.equal(soundingMidi(f4, 'D'), 66);
  assert.equal(soundingMidi(b4, 'F'), 70, 'F 大调的 B 要降');
  assert.equal(soundingMidi(b4, 'Bb'), 70);
  // 谱面写了升降号就以写的为准
  assert.equal(soundingMidi({ letter: 'F', acc: '#', octave: 4 }, 'C'), 66);
});

test('调号里已有的升降号不重复画', () => {
  assert.equal(needsAccidentalGlyph({ letter: 'F', acc: '#', octave: 4 }, 'C'), true);
  assert.equal(needsAccidentalGlyph({ letter: 'F', acc: '#', octave: 4 }, 'G'), false);
  assert.equal(needsAccidentalGlyph({ letter: 'C', acc: '#', octave: 4 }, 'G'), true);
  assert.equal(needsAccidentalGlyph({ letter: 'F', acc: '', octave: 4 }, 'G'), false);
});
