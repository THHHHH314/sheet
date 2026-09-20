// 用 VexFlow 画一个音符。
//
// 坐标说明：VexFlow 的 new Stave(x, y, w) 里，y 是谱表"上方留白"的顶端，
// 第一线实际画在 y + 40（space_above_staff_ln = 4 行 × 10px）。
// 下面的 viewBox 是按实测内容范围定死的，这样换题时谱面不会跳动。
import { vexKey, needsAccidentalGlyph, KEY_SIGS } from './notes.js';

const LAYOUT = {
  // 高音谱表：内容 y ∈ [26, 97]（高音谱号最高 26，最低 97；中央 C 符头到 95）
  treble: {
    canvas: [230, 130],
    viewBox: '0 20 230 84',
    staveX: 6,
    staveW: 218,
    staves: [{ clef: 'treble', y: 0 }],
  },
  // 低音谱表：内容 y ∈ [25, 81]（中央 C 加线在上方 30，谱表 40–80）
  bass: {
    canvas: [230, 130],
    viewBox: '0 19 230 68',
    staveX: 6,
    staveW: 218,
    staves: [{ clef: 'bass', y: 0 }],
  },
  // 大谱表：两行间距 100，连谱括号会伸到 x = -8，所以 viewBox 从 -10 起
  grand: {
    canvas: [310, 210],
    viewBox: '-10 19 310 172',
    staveX: 6,
    staveW: 288,
    staves: [{ clef: 'treble', y: 0 }, { clef: 'bass', y: 100 }],
  },
};

export const NOTE_COLORS = {
  normal: '#1d1d35',
  correct: '#12855a',
  wrong: '#cf3b46',
};

/**
 * @param {HTMLElement} host 容器（会被清空）
 * @param {{spelling:object, midi:number, keySig:string}} q 题目
 * @param {{staff:'treble'|'bass'|'grand', color?:string}} opts
 */
export function drawQuestion(host, q, opts) {
  const VF = window.Vex.Flow;
  const layout = LAYOUT[opts.staff] ?? LAYOUT.grand;
  const color = opts.color ?? NOTE_COLORS.normal;
  const keySigName = q.keySig ?? 'C';
  const drawKeySig = keySigName !== 'C';

  host.innerHTML = '';
  const renderer = new VF.Renderer(host, VF.Renderer.Backends.SVG);
  renderer.resize(layout.canvas[0], layout.canvas[1]);
  const ctx = renderer.getContext();

  const staves = layout.staves.map(({ clef, y }) => {
    const stave = new VF.Stave(layout.staveX, y, layout.staveW);
    stave.addClef(clef);
    if (drawKeySig) stave.addKeySignature(KEY_SIGS[keySigName].vex);
    stave.setContext(ctx).draw();
    return { clef, stave };
  });

  if (staves.length === 2) {
    for (const type of ['brace', 'singleLeft', 'singleRight']) {
      new VF.StaveConnector(staves[0].stave, staves[1].stave)
        .setType(type)
        .setContext(ctx)
        .draw();
    }
  }

  // 中央 C 及以上画在高音谱表，以下画在低音谱表
  const targetClef =
    staves.length === 1 ? staves[0].clef : q.midi >= 60 ? 'treble' : 'bass';

  for (const { clef, stave } of staves) {
    const tickable =
      clef === targetClef
        ? buildNote(VF, q, clef, keySigName, color)
        : new VF.GhostNote({ duration: 'w' });
    const voice = new VF.Voice({ num_beats: 4, beat_value: 4 }).addTickables([tickable]);
    new VF.Formatter().joinVoices([voice]).format([voice], layout.staveW - 80);
    voice.draw(ctx, stave);
  }

  const svg = host.querySelector('svg');
  svg.setAttribute('viewBox', layout.viewBox);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.removeAttribute('width');
  svg.removeAttribute('height');
  svg.style.width = '100%';
  svg.style.height = '100%';
  svg.style.display = 'block';
}

function buildNote(VF, q, clef, keySigName, color) {
  const note = new VF.StaveNote({ keys: [vexKey(q.spelling)], duration: 'w', clef });
  const style = { fillStyle: color, strokeStyle: color };
  if (needsAccidentalGlyph(q.spelling, keySigName)) {
    const acc = new VF.Accidental(q.spelling.acc);
    acc.setStyle(style);
    note.addModifier(acc, 0);
  }
  note.setStyle(style);
  return note;
}
