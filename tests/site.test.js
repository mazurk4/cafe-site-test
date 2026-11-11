// サイトの中身を確かめる自動テスト
// 実行のしかた: node --test
const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const publicDir = path.join(__dirname, '..', 'public');
const files = fs.readdirSync(publicDir);
const pages = files
  .filter((name) => name.endsWith('.html'))
  .map((name) => ({
    name,
    html: fs.readFileSync(path.join(publicDir, name), 'utf8'),
  }));

test('どの画像にも alt がある', () => {
  for (const { name, html } of pages) {
    for (const [img] of html.matchAll(/<img\b[^>]*>/g)) {
      assert.match(img, /\salt=/, `${name} の画像に alt がありません: ${img}`);
    }
  }
});

test('リンクと画像の先に、ファイルがある', () => {
  for (const { name, html } of pages) {
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|tel:|#)/.test(url)) continue;
      const file = url.split(/[?#]/)[0];
      assert.ok(files.includes(file), `${name} のリンク先がありません: ${url}`);
    }
  }
});

test('コンフリクトの印が残っていない', () => {
  for (const { name, html } of pages) {
    assert.doesNotMatch(html, /^(<{7}|={7}|>{7})/m, `${name} にコンフリクトの印が残っています`);
  }
});

test('HTML のコメントにパスワードが書かれていない', () => {
  for (const { name, html } of pages) {
    for (const [comment] of html.matchAll(/<!--[\s\S]*?-->/g)) {
      assert.doesNotMatch(comment, /パスワード|password/i, `${name} のコメントにパスワードがあります`);
    }
  }
});

test('公開フォルダに余計なファイルがない', () => {
  const allowed = ['.html', '.css', '.js', '.svg', '.png', '.jpg', '.jpeg', '.webp', '.ico'];
  for (const name of files) {
    assert.ok(allowed.includes(path.extname(name)), `公開しないファイルがあります: ${name}`);
    assert.doesNotMatch(name, /_old|_bak|_backup/, `古いファイルが残っています: ${name}`);
  }
});
