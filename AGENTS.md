# cafe-site

喫茶こもれびの、授業の練習用のサイトです(実在するお店ではありません)。

## 構成

- `public/` … 公開するファイル(HTML / CSS / JavaScript)
- `src/index.js` … Cloudflare Workers のプログラム(営業中か・予約の内容の確認)
- `tests/` … 自動テスト(`node --test`)
- `.github/workflows/` … GitHub Actions(テストと公開)

## コマンド

- テスト: `docker run --rm -v "${PWD}:/app" -w /app node:24-alpine node --test --test-reporter=spec`
- 表示の確認: `docker compose up -d` → http://localhost:8087

## 決まり

- 説明・コミットメッセージ・PR は **日本語** で書く
- main に直接コミットしない。ブランチを切る
- 変えたら、テストを動かして全部通ることを確かめる。`src/index.js` を変えたら、テストを足す
- npm のパッケージを増やさない(このサイトはパッケージを使っていない)
- テストを消したり、通るように書き換えたりしない

## やってはいけないこと

- `.env` やキー・パスワードを読む・書く・表示する
- `git push --force`、ファイルをまとめて消すコマンド
