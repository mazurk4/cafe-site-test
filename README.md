# 喫茶こもれび(第7回 ブランチ運用・PR)

架空のカフェのホームページです。このサイトを **自分の GitHub リポジトリ** に入れて、
ブランチを切る → プルリクエスト(PR)を作る → マージする → コンフリクトを直す、の流れを体験します。

> このリポジトリは **第8回(コードレビュー)でも使う** ので、消さずに残しておいてください。

## 準備: GitHub アカウントと Git

- GitHub のアカウントにログインできること
- ターミナル(Windows は PowerShell)で `git --version` が動くこと

### コミットに載る名前とメールアドレス(初回だけ)

```sh
git config --global user.name "ニックネーム(ローマ字)"
git config --global user.email "xxxxxxx+ユーザー名@users.noreply.github.com"
```

- コミットの名前とメールアドレスは、公開リポジトリでは **誰でも見られます**
- メールアドレスは、GitHub の **Settings → Emails** にある `@users.noreply.github.com` のアドレス(「Keep my email addresses private」にチェックすると表示されます)を使うと、本物のアドレスを出さずに済みます

## ハンズオン① 自分のリポジトリを作って、最初の push

1. 配布資料から、このフォルダを **配布資料の外** にコピーする(配布資料の中で `git init` しない)

   ```sh
   # 配布資料のフォルダ(sv41)で実行
   # Mac
   cp -R 07_git_branch_pr/sample/cafe-site ~/cafe-site

   # Windows(PowerShell)
   Copy-Item -Recurse 07_git_branch_pr/sample/cafe-site ~/cafe-site
   ```

2. VS Code で `cafe-site` フォルダを開き、**VS Code のターミナル** で起動する

   ```sh
   docker compose up -d
   ```

   http://localhost:8087 でカフェのページが出ればOK

3. GitHub の右上の「+」→「New repository」で、リポジトリを作る
   - Repository name: `cafe-site`
   - **Public** を選ぶ(第8回のブランチ保護を無料で使うため。パスワードなどは入れないこと)
   - README などは **何も追加しない**(空のまま作る)

4. 手元のフォルダを Git で管理して、GitHub に送る

   ```sh
   git init -b main
   git add .
   git commit -m "最初のコミット"
   git remote add origin https://github.com/ユーザー名/cafe-site.git
   git push -u origin main
   ```

   - 初回の push で **GitHub へのログイン** を求められたら、ブラウザでログインする
   - GitHub のページを再読み込みして、ファイルが表示されればOK

## ハンズオン② ブランチを切って、変更する

1. ブランチを作って、切り替える

   ```sh
   git switch -c feature/add-menu
   ```

2. `public/index.html` のメニューに、**好きな商品を1つ** 追加する(`<li>` の行をコピーして書き換える)
3. ブラウザを再読み込みして、追加されたことを確かめる
4. コミットする

   ```sh
   git status
   git add public/index.html
   git commit -m "メニューにチーズケーキを追加"
   ```

5. **main に戻して、ブラウザを再読み込み** してみる。そのあと、もう一度 feature に戻して再読み込み

   ```sh
   git switch main
   git switch feature/add-menu
   ```

   main では追加した商品が **消え**、feature に戻ると **また出てくる** はずです

## ハンズオン③ プルリクエストを作って、マージする

1. ブランチを GitHub に送る

   ```sh
   git push -u origin feature/add-menu
   ```

2. GitHub のリポジトリを開くと出てくる **「Compare & pull request」** を押す
3. 説明欄には、あらかじめ「何を変えたか / なぜ変えたか / 確認したこと」が入っている(`.github/pull_request_template.md`)。埋めて **「Create pull request」**
4. **「Files changed」** のタブで、変更点(緑 = 追加、赤 = 削除)を確かめる
5. **「Merge pull request」**(「Create a merge commit」のまま)→「Confirm merge」→「Delete branch」
6. 手元の main を、GitHub の main に合わせる

   ```sh
   git switch main
   git pull
   git branch -d feature/add-menu
   ```

## ハンズオン④ わざとコンフリクトを起こして、直す

ブレンドコーヒー(450円)を値上げします。スタッフ A は 480円、スタッフ B は 500円 と言っています。1人で A と B の両方をやってみます。

1. **A の作業**: いつも通り、PR を作ってマージまでする

   ```sh
   git switch -c price/480
   # public/index.html のブレンドコーヒーを 450円 → 480円 に変えて保存
   git commit -am "ブレンドコーヒーを480円にする"
   git push -u origin price/480
   ```

   GitHub で PR を作って、マージする(Delete branch も押す)

2. **B の作業**: A のマージのあと、**pull しないまま** main から切る

   ```sh
   git switch main          # "Your branch is up to date" と出るが、GitHub の main より古い
   git switch -c price/500
   # public/index.html のブレンドコーヒーを 450円 → 500円 に変えて保存
   git commit -am "ブレンドコーヒーを500円にする"
   git push -u origin price/500
   ```

   GitHub で PR を作ると、**「This branch has conflicts that must be resolved」** と出る(ぶつかった)

3. 手元で直す

   ```sh
   git switch main
   git pull                  # A の変更(480円)を取り込む
   git switch price/500
   git merge main            # CONFLICT と出る
   ```

   VS Code で `public/index.html` を開くと、次のような印が入っている

   ```
   <<<<<<< HEAD
           <li><span class="name">ブレンドコーヒー</span><span class="price">500円</span></li>
   =======
           <li><span class="name">ブレンドコーヒー</span><span class="price">480円</span></li>
   >>>>>>> main
   ```

   - `<<<<<<< HEAD` 〜 `=======` が今いるブランチ(price/500)、`=======` 〜 `>>>>>>> main` が取り込もうとしている側(main)
   - 残したい形(例: 500円)に書き直して、**印の行(`<<<<<<<` `=======` `>>>>>>>`)を全部消す**。VS Code の「Accept Current Change」などのボタンでもよい
   - 保存して、ブラウザでも確かめる

   ```sh
   git add public/index.html
   git commit -m "コンフリクトを解消して500円にする"
   git push
   ```

4. GitHub の PR を再読み込みすると、コンフリクトの表示が消えてマージできる。マージして、手元を合わせる

   ```sh
   git switch main
   git pull
   git branch -d price/480 price/500
   git log --oneline --graph --all
   ```

## 見ておくとよいコマンド

```sh
git status                         # 今どのブランチか、何を変えたか
git log --oneline --graph --all    # 履歴とブランチを線で見る(q で終了)
git branch                         # 手元のブランチの一覧(* が今いるブランチ)
cat .git/HEAD                      # 今いるブランチ(HEAD)の正体を見る
```

## つながらないとき

| 症状 | 対処 |
| --- | --- |
| `git: command not found` / `用語 'git' は…認識されません` | Git が入っていない。Windows は Git for Windows を入れて、ターミナルを開き直す |
| push でパスワードを聞かれて、通らない | GitHub のパスワードでは push できない。**VS Code のターミナル** で push し直すと、ブラウザでログインできる |
| `remote origin already exists` | `git remote set-url origin https://github.com/ユーザー名/cafe-site.git` で付け直す |
| `src refspec main does not match any` | まだコミットしていない。`git add .` と `git commit` をしてから push する |
| `LF will be replaced by CRLF` と出る(Windows) | 改行コードの注意で、エラーではない。そのまま進めてよい |
| ブランチを切り替えても、ページが変わらない | ブラウザを再読み込みする。`git status` で今のブランチを確かめる |
| `git branch -d` で `not fully merged` | PR をまだマージしていないか、マージ方法が「Create a merge commit」以外だった。GitHub でマージ済みなら `-D` で消してよい |
| `git commit` で見慣れない画面(エディタ)が開いて戻れない | Vim が開いている。`:wq` と打って Enter。次からは `git commit -m "メッセージ"` と `-m` を付ける |
| コンフリクトを直したのに、ページに `<<<<<<<` が出る | 印の行が残っている。全部消して保存し、もう一度 `git add` と `git commit` |
| `git merge` の途中で、やめたくなった | `git merge --abort` で、merge する前の状態に戻る |
| `port is already allocated` | 8087 番を使っているコンテナがないか `docker ps` で確認する |

## 片付け

```sh
docker compose down
```

`cafe-site` フォルダと GitHub のリポジトリは、**第8回でも使う** ので残しておいてください。
