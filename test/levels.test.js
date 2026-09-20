import test from 'node:test';
import assert from 'node:assert/strict';
import { LEVELS, RANGE_LO, RANGE_HI, poolFor, levelById } from '../src/levels.js';
import { toMidi, soundingMidi, isWhiteKey, naturalsBetween, spellingId } from '../src/notes.js';
import { t, setLang, LANGS } from '../src/i18n.js';

test('音域是低音 C3 到高音 E5', () => {
  assert.equal(RANGE_LO, 48);
  assert.equal(RANGE_HI, 76);
});

test('每一关的题目都在键盘上按得到', () => {
  for (const level of LEVELS) {
    const pool = poolFor(level);
    assert.ok(pool.length > 0, `关卡 ${level.id} 题库为空`);
    for (const spelling of pool) {
      for (const keySig of level.keySigs) {
        const midi = soundingMidi(spelling, keySig);
        assert.ok(
          midi >= level.kbLo && midi <= level.kbHi,
          `关卡 ${level.id}：${spellingId(spelling)}（${keySig} 调）= ${midi}，超出键盘 ${level.kbLo}–${level.kbHi}`
        );
      }
    }
  }
});

test('键盘范围不超过总音域，且两端都是白键', () => {
  for (const level of LEVELS) {
    assert.ok(level.kbLo >= RANGE_LO && level.kbHi <= RANGE_HI, `关卡 ${level.id} 键盘越界`);
    assert.ok(isWhiteKey(level.kbLo) && isWhiteKey(level.kbHi), `关卡 ${level.id} 键盘端点必须是白键`);
  }
});

test('没开升降号的关卡只出白键——否则黑键被禁用会按不到答案', () => {
  for (const level of LEVELS.filter((l) => !l.accidentals)) {
    for (const spelling of poolFor(level)) {
      for (const keySig of level.keySigs) {
        assert.ok(
          isWhiteKey(soundingMidi(spelling, keySig)),
          `关卡 ${level.id} 出现了黑键题：${spellingId(spelling)}`
        );
      }
    }
  }
});

test('升降号只在中级及以后出现', () => {
  for (const level of LEVELS) {
    if (level.accidentals) assert.notEqual(level.tier, 'starter', `入门关 ${level.id} 不该有升降号`);
    if (level.keySigs.some((k) => k !== 'C')) assert.equal(level.tier, 'advanced');
  }
});

test('升降号题目都落在黑键上（不出 E♯ / F♭ 这类写法）', () => {
  const level = levelById(7);
  const withAcc = poolFor(level).filter((s) => s.acc);
  assert.ok(withAcc.length > 0);
  for (const s of withAcc) assert.equal(isWhiteKey(toMidi(s)), false, `${spellingId(s)} 不是黑键`);
});

test('难度递进：题库越来越大', () => {
  const sizes = LEVELS.map((l) => poolFor(l).length);
  assert.ok(sizes[5] > sizes[2], '大谱表关应该比单行谱关题库大');
  assert.ok(sizes[6] > sizes[5], '加了升降号题库应该变大');
});

test('中英文案齐全', () => {
  for (const lang of LANGS) {
    setLang(lang);
    for (const level of LEVELS) {
      for (const key of [`level.${level.id}.name`, `level.${level.id}.hint`, `tier.${level.tier}`]) {
        const text = t(key);
        assert.notEqual(text, key, `${lang} 缺少文案：${key}`);
      }
      for (const keySig of level.keySigs) {
        assert.notEqual(t(`keysig.${keySig}`), `keysig.${keySig}`, `${lang} 缺少调号文案`);
      }
    }
  }
});
