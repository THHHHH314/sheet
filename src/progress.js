// 进度与自适应出题权重。全部存在 localStorage，不需要后端。
import { spellingId } from './notes.js';

const KEY = 'sheet.progress.v1';
const BOX_WEIGHT = [0, 6, 4, 2.5, 1.5, 1]; // Leitner 盒子 1..5，越生疏权重越高

const DEFAULT = {
  unlocked: 1,
  stars: {},      // levelId -> 0..3
  notes: {},      // spellingId -> { seen, correct, box, lastSeen, avgMs }
  daily: {},      // 'YYYY-MM-DD' -> seconds
  settings: { lang: null, labelMode: 'both', keyLabels: 'auto', sound: true, hintOnWrong: true },
};

let state = load();

function load() {
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return structuredClone(DEFAULT);
    const parsed = JSON.parse(raw);
    return {
      ...structuredClone(DEFAULT),
      ...parsed,
      settings: { ...DEFAULT.settings, ...(parsed.settings ?? {}) },
    };
  } catch {
    return structuredClone(DEFAULT);
  }
}

function save() {
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* 隐私模式下写入会失败，忽略即可，本轮练习仍然可用 */
  }
}

export function getState() {
  return state;
}

export function settings() {
  return state.settings;
}

export function updateSettings(patch) {
  Object.assign(state.settings, patch);
  save();
}

export function statFor(spelling) {
  const id = spellingId(spelling);
  return state.notes[id] ?? { seen: 0, correct: 0, box: 1, lastSeen: 0, avgMs: 0 };
}

/** 记一次作答。first 表示是不是第一次尝试就答对 */
export function recordAnswer(spelling, correct, ms) {
  const id = spellingId(spelling);
  const s = state.notes[id] ?? { seen: 0, correct: 0, box: 1, lastSeen: 0, avgMs: 0 };
  s.seen += 1;
  if (correct) {
    s.correct += 1;
    s.box = Math.min(5, s.box + 1);
  } else {
    s.box = 1;
  }
  s.avgMs = s.avgMs ? Math.round(s.avgMs * 0.7 + ms * 0.3) : ms;
  s.lastSeen = Date.now();
  state.notes[id] = s;
  save();
}

/**
 * 加权随机抽题：生疏的音更容易出现，反应慢的音也会加权，
 * 刚出过的音降权，避免连续重复。
 */
export function pickWeighted(pool, recentIds = []) {
  const weights = pool.map((spelling) => {
    const s = statFor(spelling);
    let w = BOX_WEIGHT[s.box] ?? 1;
    if (s.seen === 0) w *= 2.2;              // 没见过的先教
    if (s.avgMs > 4000) w *= 1.4;            // 想得久说明不熟
    if (recentIds.includes(spellingId(spelling))) w *= 0.12;
    return w;
  });
  const total = weights.reduce((a, b) => a + b, 0);
  let r = Math.random() * total;
  for (let i = 0; i < pool.length; i++) {
    r -= weights[i];
    if (r <= 0) return pool[i];
  }
  return pool[pool.length - 1];
}

export function starsFor(accuracy) {
  if (accuracy >= 0.95) return 3;
  if (accuracy >= 0.85) return 2;
  if (accuracy >= 0.7) return 1;
  return 0;
}

/** 完成一轮。返回 { stars, unlockedNext } */
export function finishRound(level, accuracy, nextLevelId) {
  const stars = starsFor(accuracy);
  state.stars[level.id] = Math.max(state.stars[level.id] ?? 0, stars);
  let unlockedNext = false;
  if (nextLevelId && accuracy >= 0.85 && state.unlocked < nextLevelId) {
    state.unlocked = nextLevelId;
    unlockedNext = true;
  }
  save();
  return { stars, unlockedNext };
}

export function addPracticeSeconds(seconds) {
  const k = todayKey();
  state.daily[k] = (state.daily[k] ?? 0) + Math.max(0, Math.round(seconds));
  save();
}

export function todaySeconds() {
  return state.daily[todayKey()] ?? 0;
}

export function totalStars() {
  return Object.values(state.stars).reduce((a, b) => a + b, 0);
}

export function resetAll() {
  state = structuredClone(DEFAULT);
  save();
}

function todayKey() {
  const d = new Date();
  const p = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}
