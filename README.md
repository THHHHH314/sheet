# 五线谱小达人 / Staff Star

给孩子练识谱的小工具：屏幕上出一个音，在下方的钢琴键盘上按出来。
中英双语，音名（C D E）和唱名（do re mi）同时标注，iPad 上可离线使用。

A staff-reading trainer for kids: a note appears on the staff, the child taps it
on the on-screen piano. Bilingual (中文 / English), shows both letter names and
solfège, works offline on an iPad.

参考了 [leafo/sightreading.training](https://github.com/leafo/sightreading.training) 的练习思路，
但改成了不需要 MIDI 键盘、面向低龄孩子的分关卡版本。

---

## 特点 / Features

- **不需要 MIDI 键盘** —— 屏幕底部就是钢琴键盘，触屏直接按
- **音名 + 唱名** —— 键面上下两行（C / do），可在设置里改成只显示一种
- **中英双语** —— 一键切换；英文唱名用 `ti`，中文用 `si`
- **八个关卡** —— 从中央 C 三个音开始，升降号到中级才出现，调号是最后一关
- **自适应出题** —— 记录每个音的正确率和反应时间，生疏的音出现得更频繁（Leitner 盒子）
- **答错不惩罚** —— 先提示"再试一次"，连错两次才高亮正确的键
- **iPad 友好** —— PWA 可加到主屏、离线可用，触屏零延迟，横竖屏都适配

## 音域 / Range

低音谱表 C3 到高音谱表 E5（`src/levels.js` 里的 `RANGE_LO` / `RANGE_HI`）。
要改音域，改这两个常量和对应关卡的 `lo` / `hi` / `kbLo` / `kbHi` 即可。

## 关卡 / Levels

| # | 关卡 | Level | 谱表 | 内容 |
|---|------|-------|------|------|
| 1 | 中央 C 三兄弟 | Middle C & friends | 高音 | C4 D4 E4 |
| 2 | 高音谱表 · 下半区 | Treble · lower half | 高音 | C4–C5 |
| 3 | 高音谱表 · 全部 | Treble · all notes | 高音 | C4–E5 |
| 4 | 低音谱表 · 入门 | Bass · first steps | 低音 | G3–C4 |
| 5 | 低音谱表 · 全部 | Bass · all notes | 低音 | C3–C4 |
| 6 | 大谱表 · 综合 | Grand staff | 大谱表 | C3–E5 |
| 7 | 加入升降号 | Sharps & flats | 大谱表 | C3–E5 + ♯/♭ |
| 8 | 调号挑战 | Key signatures | 大谱表 | G / F / D / B♭ 调 |

一轮 20 题，正确率 ≥ 85% 解锁下一关；≥ 95% 三星。

## 本地运行 / Running locally

纯静态页面，没有构建步骤，但 ES module 需要通过 HTTP 打开（不能直接双击 `index.html`）：

```bash
npm start          # 等价于 python3 -m http.server 8080
# 然后浏览器打开 http://localhost:8080
```

跑单元测试：

```bash
npm test
```

## 放到 iPad 上 / Getting it onto an iPad

1. 把仓库推到 GitHub，在仓库设置里开启 **GitHub Pages**（分支选 `main`，目录选 `/`）
2. iPad 用 Safari 打开 Pages 地址
3. 分享 → **添加到主屏幕**，之后就是全屏 App，断网也能练

## 代码结构 / Layout

```
index.html            三个界面：主页 / 练习 / 结果 + 设置
styles.css            触屏优先的布局，键盘固定在底部
src/notes.js          音高模型：MIDI ↔ 音名/唱名/升降/调号（纯函数，有测试）
src/levels.js         关卡定义与出题池
src/staff.js          VexFlow 画谱（viewBox 按实测内容范围定死，换题不跳动）
src/keyboard.js       屏幕钢琴，pointerdown 响应
src/audio.js          Web Audio 合成器，不用采样文件
src/progress.js       进度、星星、自适应出题权重（localStorage）
src/i18n.js           中英文案 + 唱名表
src/app.js            界面切换与答题流程
vendor/               VexFlow 4.2.3（MIT，内嵌 Bravura 字体，离线可用）
test/                 node:test 单元测试，无外部依赖
```

## 接下来可以加的 / Possible next steps

- 节奏训练（音高和节奏分开练，熟了再合）
- 家长端进度报告（每个音的正确率曲线）
- 连上 MIDI 键盘时自动用 Web MIDI 输入
- 更多调号与中央 C 以外的加线音

## License

代码 MIT。`vendor/vexflow-bravura.js` 来自 [VexFlow](https://github.com/0xfe/vexflow)（MIT），
内含 Bravura 字体（SIL OFL）。
