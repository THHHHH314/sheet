// 把 index.html 拆成 Artifact 需要的形式：宿主已经提供 doctype/html/head/body
// 和一份带 viewport-fit=cover 的 viewport meta，所以这里只留页面内容。
// 用法：node tools/build-artifact.mjs <输出路径>
import { readFileSync, writeFileSync } from 'node:fs';

const src = readFileSync(new URL('../index.html', import.meta.url), 'utf8');

const title = src.match(/<title>([\s\S]*?)<\/title>/)[1];
const body = src.match(/<body>([\s\S]*?)<\/body>/)[1].trim();
// 保留 head 里指向自有文件的 link/script，丢掉 meta（宿主自带）
const head = src.match(/<head>([\s\S]*?)<\/head>/)[1];
const keep = [...head.matchAll(/<(?:link|script)\b[^>]*>(?:<\/script>)?/g)]
  .map((m) => m[0])
  .filter((tag) => !tag.includes('rel="manifest"') && !tag.includes('apple-touch-icon'));

const out = [`<title>${title}</title>`, ...keep, '', body, ''].join('\n');
writeFileSync(process.argv[2] ?? 'artifact.html', out);
console.log(`wrote ${process.argv[2]} (${out.length} bytes)`);
