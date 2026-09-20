// 界面与练习流程。
import { LEVELS, ROUND_SIZE, levelById, poolFor } from './levels.js';
import { soundingMidi, spellingId, noteLabel } from './notes.js';
import { drawQuestion, NOTE_COLORS } from './staff.js';
import { Keyboard } from './keyboard.js';
import * as i18n from './i18n.js';
import * as audio from './audio.js';
import * as store from './progress.js';

const $ = (sel) => document.querySelector(sel);
const screens = new Map(
  [...document.querySelectorAll('.screen')].map((el) => [el.dataset.screen, el])
);

const el = {
  levels: $('#levels'),
  totalStars: $('#total-stars'),
  todayChip: $('#today-chip'),
  staff: $('#staff'),
  keysigNote: $('#keysig-note'),
  feedback: $('#feedback'),
  progressBar: $('#progress-bar'),
  scoreCorrect: $('#score-correct'),
  scoreTotal: $('#score-total'),
};

const keyboard = new Keyboard($('#keyboard'));
keyboard.onPress = onKeyPress;

let round = null;
let current = null;
let advanceTimer = null;

/** 当前的标注偏好：音名 / 唱名 / 两者都要 */
function labelOpts(withOctave = false) {
  return {
    mode: store.settings().labelMode,
    solfege: i18n.solfegeTable(),
    withOctave,
  };
}

// ---------- 界面切换 ----------

function showScreen(name) {
  for (const [key, node] of screens) node.classList.toggle('is-active', key === name);
  if (name === 'home') renderHome();
}

function renderHome() {
  const state = store.getState();
  el.totalStars.textContent = String(store.totalStars());
  el.todayChip.textContent = i18n.t('home.today', { n: Math.round(store.todaySeconds() / 60) });
  el.levels.innerHTML = '';

  for (const level of LEVELS) {
    const locked = level.id > state.unlocked;
    const stars = state.stars[level.id] ?? 0;
    const btn = document.createElement('button');
    btn.className = 'lvl';
    btn.type = 'button';
    btn.disabled = locked;
    btn.innerHTML = `
      <div class="lvl__top">
        <span class="lvl__tier" data-tier="${level.tier}">${i18n.t(`tier.${level.tier}`)}</span>
      </div>
      <div class="lvl__name">${i18n.t(`level.${level.id}.name`)}</div>
      <div class="lvl__hint">${i18n.t(`level.${level.id}.hint`)}</div>
      ${locked ? '<span class="lvl__lock">🔒</span>' : `<span class="lvl__stars">${starText(stars)}</span>`}
    `;
    if (!locked) btn.addEventListener('click', () => startRound(level.id));
    el.levels.appendChild(btn);
  }
}

const starText = (n) => '★'.repeat(n) + '☆'.repeat(3 - n);

// ---------- 一轮练习 ----------

function startRound(levelId) {
  const level = levelById(levelId);
  const s = store.settings();
  const showNames =
    s.keyLabels === 'always' ? true : s.keyLabels === 'never' ? false : level.showNames;

  round = {
    level,
    pool: poolFor(level),
    keySig: level.keySigs[Math.floor(Math.random() * level.keySigs.length)],
    index: 0,
    correct: 0,
    wrong: new Map(),
    recent: [],
    startedAt: Date.now(),
  };

  keyboard.render({
    lo: level.kbLo,
    hi: level.kbHi,
    blackEnabled: level.accidentals,
    showNames,
    labelMode: s.labelMode,
    solfege: i18n.solfegeTable(),
  });

  // 谱面卡片跟着谱表比例走：单行谱扁一些，大谱表高一些
  document.documentElement.style.setProperty(
    '--stage-ar',
    level.staff === 'grand' ? '1.75' : '2.6'
  );
  el.scoreTotal.textContent = String(ROUND_SIZE);
  el.keysigNote.textContent = round.keySig === 'C' ? '' : i18n.t(`keysig.${round.keySig}`);
  showScreen('play');
  nextQuestion();
}

function nextQuestion() {
  clearTimeout(advanceTimer);
  if (round.index >= ROUND_SIZE) return endRound();

  const spelling = store.pickWeighted(round.pool, round.recent);
  current = {
    spelling,
    midi: soundingMidi(spelling, round.keySig),
    keySig: round.keySig,
    attempts: 0,
    shownAt: performance.now(),
  };
  round.recent = [spellingId(spelling), ...round.recent].slice(0, 3);

  keyboard.clearMarks();
  keyboard.setLocked(false);
  el.feedback.textContent = ' ';
  el.feedback.className = 'feedback';
  paint(NOTE_COLORS.normal);
  updateHud();
}

function paint(color) {
  drawQuestion(el.staff, current, { staff: round.level.staff, color });
}

function updateHud() {
  el.progressBar.style.width = `${(round.index / ROUND_SIZE) * 100}%`;
  el.scoreCorrect.textContent = String(round.correct);
}

function onKeyPress(midi) {
  audio.unlock();
  if (!current) return;
  const ms = performance.now() - current.shownAt;

  if (midi === current.midi) {
    if (current.attempts === 0) {
      round.correct += 1;
      store.recordAnswer(current.spelling, true, ms);
    }
    keyboard.setLocked(true);
    keyboard.clearMarks();
    keyboard.mark(midi, 'correct');
    paint(NOTE_COLORS.correct);
    audio.playNote(midi);
    if (current.attempts === 0) audio.playCorrect();
    el.feedback.textContent = `${noteLabel(current.spelling, labelOpts(true))} ✓`;
    el.feedback.className = 'feedback is-ok';
    round.index += 1;
    updateHud();
    advanceTimer = setTimeout(nextQuestion, 750);
    return;
  }

  if (current.attempts === 0) {
    store.recordAnswer(current.spelling, false, ms);
    const id = spellingId(current.spelling);
    const prev = round.wrong.get(id);
    round.wrong.set(id, { spelling: current.spelling, count: (prev?.count ?? 0) + 1 });
  }
  current.attempts += 1;

  keyboard.mark(midi, 'wrong');
  setTimeout(() => {
    keyboard.clearMarks();
    applyHint();
  }, 520);
  paint(NOTE_COLORS.wrong);
  audio.playNote(midi, { gain: 0.14 });
  audio.playWrong();

  el.feedback.className = 'feedback is-bad';
  el.feedback.textContent =
    current.attempts === 1
      ? i18n.t('play.retry')
      : i18n.t('play.answerIs', { name: noteLabel(current.spelling, labelOpts(true)) });
  applyHint();
}

/** 连错两次后才高亮正确的键，先给孩子自己想的机会 */
function applyHint() {
  if (!current || current.attempts < 2) return;
  if (store.settings().hintOnWrong) keyboard.mark(current.midi, 'hint');
}

function endRound() {
  const accuracy = round.correct / ROUND_SIZE;
  const seconds = (Date.now() - round.startedAt) / 1000;
  store.addPracticeSeconds(seconds);

  const nextLevel = LEVELS.find((l) => l.id === round.level.id + 1);
  const { stars, unlockedNext } = store.finishRound(round.level, accuracy, nextLevel?.id);

  $('#result-stars').innerHTML = [0, 1, 2]
    .map((i) => (i < stars ? '★' : '<span class="off">★</span>'))
    .join('');
  $('#result-title').textContent = i18n.t(
    stars === 3 ? 'result.title3' : stars >= 1 ? 'result.title1' : 'result.title0'
  );
  $('#result-acc').textContent = `${Math.round(accuracy * 100)}%`;
  $('#result-right').textContent = `${round.correct}/${ROUND_SIZE}`;
  $('#result-time').textContent = formatTime(seconds);

  const weak = [...round.wrong.values()].sort((a, b) => b.count - a.count).slice(0, 5);
  $('#result-weak').innerHTML = weak.length
    ? `<span class="weak__title">${i18n.t('result.weak')}</span>` +
      weak
        .map((w) => `<span class="weak__chip">${noteLabel(w.spelling, labelOpts(true))}</span>`)
        .join('')
    : '';

  const unlockEl = $('#result-unlock');
  unlockEl.hidden = !unlockedNext;
  if (unlockedNext) {
    unlockEl.textContent = i18n.t('result.unlock', {
      name: i18n.t(`level.${nextLevel.id}.name`),
    });
    audio.playLevelUp();
  }

  current = null;
  showScreen('result');
}

function formatTime(sec) {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return `${m}:${String(s).padStart(2, '0')}`;
}

function quitRound() {
  clearTimeout(advanceTimer);
  if (round) store.addPracticeSeconds((Date.now() - round.startedAt) / 1000);
  current = null;
  showScreen('home');
}

// ---------- 语言与设置 ----------

function applyLang(lang, { persist = true } = {}) {
  i18n.setLang(lang);
  if (persist) store.updateSettings({ lang });
  i18n.applyStatic();
  syncSettingsControls();
  renderHome();
}

function syncSettingsControls() {
  const s = store.settings();
  $('#set-lang').value = i18n.getLang();
  $('#set-labelmode').value = s.labelMode;
  $('#set-keylabels').value = s.keyLabels;
  $('#set-sound').checked = s.sound;
  $('#set-hint').checked = s.hintOnWrong;
}

function bindSettings() {
  $('#set-lang').addEventListener('change', (e) => applyLang(e.target.value));
  $('#set-labelmode').addEventListener('change', (e) =>
    store.updateSettings({ labelMode: e.target.value })
  );
  $('#set-keylabels').addEventListener('change', (e) =>
    store.updateSettings({ keyLabels: e.target.value })
  );
  $('#set-sound').addEventListener('change', (e) => {
    store.updateSettings({ sound: e.target.checked });
    audio.setEnabled(e.target.checked);
  });
  $('#set-hint').addEventListener('change', (e) =>
    store.updateSettings({ hintOnWrong: e.target.checked })
  );
  // 两次点击确认，比 confirm() 稳（沙箱里的弹窗可能被拦掉）
  let resetArmed = false;
  let resetTimer = null;
  const btnReset = $('#btn-reset');
  const disarmReset = () => {
    clearTimeout(resetTimer);
    resetArmed = false;
    btnReset.textContent = i18n.t('settings.reset');
    btnReset.classList.remove('btn--armed');
  };
  btnReset.addEventListener('click', () => {
    if (!resetArmed) {
      resetArmed = true;
      btnReset.textContent = i18n.t('settings.resetConfirm');
      btnReset.classList.add('btn--armed');
      resetTimer = setTimeout(disarmReset, 4000);
      return;
    }
    const lang = i18n.getLang();
    store.resetAll();
    disarmReset();
    applyLang(lang);
  });
  $('#btn-lang').addEventListener('click', () =>
    applyLang(i18n.getLang() === 'zh' ? 'en' : 'zh')
  );
}

// ---------- 启动 ----------

document.querySelectorAll('[data-go]').forEach((btn) => {
  btn.addEventListener('click', () => showScreen(btn.dataset.go));
});
$('#btn-quit').addEventListener('click', quitRound);
$('#btn-again').addEventListener('click', () => round && startRound(round.level.id));
document.addEventListener('pointerdown', audio.unlock, { once: true });

audio.setEnabled(store.settings().sound);
bindSettings();
applyLang(store.settings().lang ?? i18n.detectLang(), { persist: false });
showScreen('home');

if ('serviceWorker' in navigator && location.protocol === 'https:') {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => {}));
}
