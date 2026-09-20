// 中英双语文案。界面语言只影响文字，不影响音高逻辑。
// 唱名表也放在这里：中文习惯用 si，英文用 ti。

export const LANGS = ['zh', 'en'];

export const SOLFEGE = {
  zh: { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'si' },
  en: { C: 'do', D: 're', E: 'mi', F: 'fa', G: 'sol', A: 'la', B: 'ti' },
};

const DICT = {
  zh: {
    'app.title': '五线谱小达人',
    'app.range': '音域：低音 C3 — 高音 E5',
    'home.today': '今天 {n} 分钟',
    'home.settings': '设置',
    'home.langToggle': 'EN',

    'tier.starter': '入门',
    'tier.middle': '中级',
    'tier.advanced': '高级',

    'level.1.name': '中央 C 三兄弟',
    'level.1.hint': '先认住中央 C，再往上数 D、E',
    'level.2.name': '高音谱表 · 下半区',
    'level.2.hint': '中央 C 到高音 C，一个八度',
    'level.3.name': '高音谱表 · 全部',
    'level.3.hint': '记住第二线的 G，其他音跟它比高低',
    'level.4.name': '低音谱表 · 入门',
    'level.4.hint': '从中央 C 往下数：B、A、G',
    'level.5.name': '低音谱表 · 全部',
    'level.5.hint': '记住第四线的 F，其他音跟它比高低',
    'level.6.name': '大谱表 · 综合',
    'level.6.hint': '上下两行一起来，中央 C 在正中间',
    'level.7.name': '加入升降号',
    'level.7.hint': '♯ 往右按一个黑键，♭ 往左按一个黑键',
    'level.8.name': '调号挑战',
    'level.8.hint': '开头的 ♯♭ 管整行——看到就要记住',

    'keysig.C': 'C 大调',
    'keysig.G': 'G 大调（1 个 ♯）',
    'keysig.D': 'D 大调（2 个 ♯）',
    'keysig.F': 'F 大调（1 个 ♭）',
    'keysig.Bb': '降 B 大调（2 个 ♭）',

    'play.back': '返回',
    'play.retry': '再看一眼，再试一次',
    'play.answerIs': '是 {name}',

    'result.title3': '全对级别，太棒了！',
    'result.title1': '练完啦，有进步！',
    'result.title0': '再来一轮就熟了',
    'result.accuracy': '正确率',
    'result.firstTry': '一次答对',
    'result.time': '用时',
    'result.weak': '下次重点：',
    'result.unlock': '解锁新关卡：{name}',
    'result.home': '回主页',
    'result.again': '再来一轮',

    'settings.title': '设置',
    'settings.lang': '界面语言',
    'settings.labelMode': '标注方式',
    'settings.labelMode.both': '音名 + 唱名（C / do）',
    'settings.labelMode.letter': '只用音名（C D E）',
    'settings.labelMode.solfege': '只用唱名（do re mi）',
    'settings.keyLabels': '键盘上标音名',
    'settings.keyLabels.auto': '自动（前几关显示）',
    'settings.keyLabels.always': '一直显示',
    'settings.keyLabels.never': '不显示',
    'settings.sound': '声音',
    'settings.hint': '答错时高亮正确的键',
    'settings.reset': '清除全部进度',
    'settings.resetConfirm': '清除全部进度和星星？',
    'settings.done': '完成',
  },

  en: {
    'app.title': 'Staff Star',
    'app.range': 'Range: bass C3 — treble E5',
    'home.today': '{n} min today',
    'home.settings': 'Settings',
    'home.langToggle': '中文',

    'tier.starter': 'Starter',
    'tier.middle': 'Middle',
    'tier.advanced': 'Advanced',

    'level.1.name': 'Middle C & friends',
    'level.1.hint': 'Learn middle C first, then count up: D, E',
    'level.2.name': 'Treble · lower half',
    'level.2.hint': 'Middle C up to high C — one octave',
    'level.3.name': 'Treble · all notes',
    'level.3.hint': 'Remember G on line 2, then count from it',
    'level.4.name': 'Bass · first steps',
    'level.4.hint': 'Count down from middle C: B, A, G',
    'level.5.name': 'Bass · all notes',
    'level.5.hint': 'Remember F on line 4, then count from it',
    'level.6.name': 'Grand staff',
    'level.6.hint': 'Both staves together — middle C sits in between',
    'level.7.name': 'Sharps & flats',
    'level.7.hint': '♯ = one black key right, ♭ = one black key left',
    'level.8.name': 'Key signatures',
    'level.8.hint': 'The ♯/♭ at the start applies to the whole line',

    'keysig.C': 'C major',
    'keysig.G': 'G major (1 sharp)',
    'keysig.D': 'D major (2 sharps)',
    'keysig.F': 'F major (1 flat)',
    'keysig.Bb': 'B♭ major (2 flats)',

    'play.back': 'Back',
    'play.retry': 'Look again — try once more',
    'play.answerIs': "It's {name}",

    'result.title3': 'Perfect round — amazing!',
    'result.title1': 'Nice work — getting better!',
    'result.title0': 'One more round and it clicks',
    'result.accuracy': 'Accuracy',
    'result.firstTry': 'First try',
    'result.time': 'Time',
    'result.weak': 'Focus next time:',
    'result.unlock': 'Unlocked: {name}',
    'result.home': 'Home',
    'result.again': 'Again',

    'settings.title': 'Settings',
    'settings.lang': 'Language',
    'settings.labelMode': 'Note labels',
    'settings.labelMode.both': 'Letters + solfège (C / do)',
    'settings.labelMode.letter': 'Letters only (C D E)',
    'settings.labelMode.solfege': 'Solfège only (do re mi)',
    'settings.keyLabels': 'Labels on keys',
    'settings.keyLabels.auto': 'Auto (early levels only)',
    'settings.keyLabels.always': 'Always show',
    'settings.keyLabels.never': 'Never show',
    'settings.sound': 'Sound',
    'settings.hint': 'Highlight the right key after a miss',
    'settings.reset': 'Reset all progress',
    'settings.resetConfirm': 'Erase all progress and stars?',
    'settings.done': 'Done',
  },
};

let lang = 'zh';

export function detectLang() {
  const nav = (globalThis.navigator?.language || 'en').toLowerCase();
  return nav.startsWith('zh') ? 'zh' : 'en';
}

export function getLang() {
  return lang;
}

export function setLang(next) {
  lang = LANGS.includes(next) ? next : 'en';
  // 在 Node 里跑单元测试时没有 document
  if (typeof document === 'undefined') return;
  document.documentElement.lang = lang === 'zh' ? 'zh-CN' : 'en';
  document.title = t('app.title');
}

export function solfegeTable() {
  return SOLFEGE[lang];
}

export function t(key, vars) {
  const raw = DICT[lang][key] ?? DICT.en[key] ?? key;
  if (!vars) return raw;
  return raw.replace(/\{(\w+)\}/g, (_, k) => (vars[k] ?? `{${k}}`));
}

/** 把所有带 data-i18n / data-i18n-aria 的静态文案刷一遍 */
export function applyStatic(root = document) {
  for (const node of root.querySelectorAll('[data-i18n]')) {
    node.textContent = t(node.dataset.i18n);
  }
  for (const node of root.querySelectorAll('[data-i18n-aria]')) {
    node.setAttribute('aria-label', t(node.dataset.i18nAria));
  }
}
