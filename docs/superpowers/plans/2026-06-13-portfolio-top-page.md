# ポートフォリオ刷新 — トップページ 実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. 実装時は `~/.claude/skills/web-coding/SKILL.md` の命名規則・手順に従うこと。

**Goal:** 既存のSCSS土台を新デザインシステム（Forest Green / 紙地・墨色 / Fraunces × Shippori Mincho）で再整備し、ワークス先行構成のトップページ（Header / Hero / Works / About / Skill / Flow / Contact / Footer）を完成させる。

**Architecture:** FLOCSS構成（foundation / layout / component / page）と CSSカスタムプロパティの2層トークン（primitive → semantic）という枠組みだけを使う。既存スキャフォルドの中身は別案件由来の不要物なので**温存しない** — 不要ファイルは削除し、使うファイルは新デザイン用に新規から書き直す（互換エイリアス等は持たない）。アニメーションは GSAP + ScrollTrigger を使い、`prefers-reduced-motion` を尊重。

**Tech Stack:** HTML / SCSS(FLOCSS×BEM) / Vanilla JS(ESM) / GSAP + ScrollTrigger / Dart Sass CLI。ビルド: `sass assets/scss/style.scss assets/css/style.css`。

**設計の出典:** `docs/superpowers/specs/2026-06-13-portfolio-renewal-design.md`

**フォローアップ計画（本プランの範囲外）:** 詳細ケーススタディページ×5 と privacy ページは別プラン（`2026-06-13-portfolio-detail-pages.md`）で扱う。

---

## 共通の検証方法（このプロジェクトにはテストフレームワークが無い）

各タスクの「テスト」は以下で行う:
- **コンパイル**: `sass assets/scss/style.scss assets/css/style.css --no-source-map` がエラー無しで完了する。
- **目視**: `python3 -m http.server 8000`（リポジトリ直下）を起動し、`http://localhost:8000` をブラウザで開いて該当セクションの表示・レスポンシブ（DevToolsで 375 / 768 / 1024 / 1440px）を確認する。
- サーバは一度起動したら起動しっぱなしでよい。SCSS編集のたびにコンパイルコマンドを再実行する（または別ターミナルで `sass --watch assets/scss/style.scss assets/css/style.css`）。

---

## File Structure（このプランで作成・変更するファイル）

**削除（別案件由来の不要ファイル — Task 0）**
- `assets/js/slider/gallery-slider.js` / `assets/js/slider/staff-slider.js` — このサイトに無い機能
- `assets/js/form/form-validation.js` — トップにフォームを置かないため（将来 contact ページを作る際に新規作成する）
- `assets/scss/component/_cards.scss` — `_work-card.scss` に置き換えるため
- 空になった `assets/js/slider/` / `assets/js/form/` ディレクトリ

> 詳細ページ用の partial（`page/detail/*`, `page/privacy/*`）と detail で使う component（`_breadcrumb` / `_table` / `_notice` / `_form` / `_title`）は本プランでは触らず、フォローアッププランで新規に書き直す。

**作成・変更**
- `assets/scss/foundation/tokens/_color.scss` — 配色トークンを新デザインに全面更新
- `assets/scss/foundation/tokens/_font.scss` — フォント/サイズ/行間トークンを更新
- `assets/scss/foundation/_base.scss` — `m.mq()` バグ修正＋body基本スタイル
- `assets/scss/layout/_container.scss` — 中央寄せコンテナ
- `assets/scss/layout/_header.scss` — ヘッダー（全面書き換え）
- `assets/scss/layout/_footer.scss` — フッター（全面書き換え）
- `assets/scss/component/_button.scss` — CTAボタン（トークン整合に修正）
- `assets/scss/component/_section-head.scss` — eyebrow＋見出しの共通パーツ（新規）
- `assets/scss/component/_work-card.scss` — 作品カード（新規）
- `assets/scss/component/_tag.scss` — タグ（更新）
- `assets/scss/component/_index.scss` — 新コンポーネントの @use 追記
- `assets/scss/page/top/_top-kv.scss` — Hero（全面書き換え）
- `assets/scss/page/top/_top-work.scss` — Works（全面書き換え）
- `assets/scss/page/top/_top-about.scss` — About（全面書き換え）
- `assets/scss/page/top/_top-skill.scss` — Skill（全面書き換え）
- `assets/scss/page/top/_top-flow.scss` — Flow（全面書き換え）
- `assets/scss/page/top/_top-contact.scss` — Contact CTA（全面書き換え）
- `assets/scss/layout/_index.scss` — `_container` の @use 追記（未登録の場合）
- `index.html` — head（フォント/メタ）＋body（トップページ全マークアップ）
- `assets/js/main.js` — 不要 import 整理＋新演出の初期化
- `assets/js/component/scroll-reveal.js` — スクロール連動フェードイン（新規, reduced-motion対応）

---

## Task 0: 不要な土台ファイルの削除

**Files:**
- Delete: `assets/js/slider/gallery-slider.js`, `assets/js/slider/staff-slider.js`, `assets/js/form/form-validation.js`
- Delete: `assets/scss/component/_cards.scss`
- Modify: `assets/scss/component/_index.scss`（`_cards` の登録を除去）

- [ ] **Step 1: 不要JSと不要コンポーネントを削除**

```bash
git rm assets/js/slider/gallery-slider.js assets/js/slider/staff-slider.js assets/js/form/form-validation.js assets/scss/component/_cards.scss
rmdir assets/js/slider assets/js/form 2>/dev/null || true
```

- [ ] **Step 2: `component/_index.scss` から `_cards` の行を除去**

`assets/scss/component/_index.scss` を開き、`@use "cards";`（または `@forward "cards";`）の行を削除する。他の行（tag/button/logo/title/table/breadcrumb/notice/form）はこの段階では残す。

- [ ] **Step 3: コンパイルしてエラーが出ないことを確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 削除したファイルへの参照が無くなり、エラー無しで完了。

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "別案件由来の不要な土台ファイル(slider/form/cards)を削除"
```

---

## Task 1: 配色・フォントトークンを新デザインに更新

**Files:**
- Modify: `assets/scss/foundation/tokens/_color.scss`（全面書き換え）
- Modify: `assets/scss/foundation/tokens/_font.scss`（全面書き換え）

- [ ] **Step 1: `_color.scss` を新パレットで書き換える**

`assets/scss/foundation/tokens/_color.scss` の全内容を以下に置き換える:

```scss
// _color.scss
// ===========================================
// アクセント: Forest Green / 方向性: 上品×クリエイティブ
// 2層構成: primitive(素の値) → semantic(役割名)
// HTML/component 側では semantic だけを使う
// ===========================================

:root {
  // -------------------------------------------
  // primitive（素の値・直接使わない）
  // -------------------------------------------
  --color-white:     #ffffff;
  --color-paper:     #f7f5f0; // 暖色ニュートラルの紙地
  --color-paper-100: #efece4; // 紙地のひとつ濃い面
  --color-ink:       #17120e; // 墨色（暗背景・濃い文字）
  --color-ink-700:   #2a2420; // 墨色の面の補助

  --color-gray-400:  #9a958c;
  --color-gray-600:  #6b655c; // 紙地上のミュート文字

  // Forest Green（アクセント・3段階）
  --color-green-700: #2f4a3a; // base
  --color-green-600: #3a5a40; // hover・やや明るい
  --color-green-300: #8aa595; // muted・補助線/暗背景上のアクセント文字

  // -------------------------------------------
  // semantic（役割名・こちらを使う）
  // -------------------------------------------
  // テキスト
  --color-text-base:   var(--color-ink);
  --color-text-muted:  var(--color-gray-600);
  --color-text-invert: var(--color-paper); // 暗背景上の文字

  // 背景
  --color-bg-base:    var(--color-paper);   // ページ全体
  --color-bg-surface: var(--color-white);   // カード・面
  --color-bg-subtle:  var(--color-paper-100);// セクション区切り
  --color-bg-ink:     var(--color-ink);     // Hero/About/Footer の暗面

  // アクセント
  --color-accent:        var(--color-green-700);
  --color-accent-hover:  var(--color-green-600);
  --color-accent-muted:  var(--color-green-300);
  --color-on-accent:     var(--color-paper); // 緑面上の文字

  // ボーダー
  --color-border:        rgba(23, 18, 14, 0.1);  // 紙地上の罫
  --color-border-invert: rgba(247, 245, 240, 0.18); // 墨面上の罫
}
```

- [ ] **Step 2: `_font.scss` を新フォントで書き換える**

`assets/scss/foundation/tokens/_font.scss` の全内容を以下に置き換える:

```scss
// _font.scss
:root {
  // フォントファミリー（display=英見出し/イタリックアクセント, base=和文本文）
  --font-display: "Fraunces", "Shippori Mincho", serif;
  --font-base:    "Shippori Mincho", serif;

  // ルート/本文
  --font-size-root:     100%;
  --font-size-base:     1rem;     // 16px
  --line-height-base:   1.85;     // 明朝本文の読みやすさ
  --letter-spacing-base: 0.02em;

  // フォントサイズ（clamp でレスポンシブ）
  --fs-display: clamp(3rem, 8vw, 5.5rem);   // Hero 大見出し
  --fs-h2:      clamp(1.9rem, 4vw, 3rem);   // セクション見出し
  --fs-h3:      clamp(1.25rem, 2.4vw, 1.75rem); // カード/サブ見出し
  --fs-body:    1rem;
  --fs-small:   0.8125rem;  // 13px ラベル・タグ

  // ウェイト
  --fw-regular: 400;
  --fw-medium:  500;
  --fw-bold:    700;

  // 行間
  --lh-tight: 1.1;  // 大見出し
  --lh-base:  1.85; // 本文
}
```

- [ ] **Step 3: コンパイルしてエラーが出ないことを確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: エラー無しで完了（既存ファイルが未定義トークンを参照していてもSassは警告せずコンパイルは通る。後続タスクで参照側を修正する）。

- [ ] **Step 4: Commit**

```bash
git add assets/scss/foundation/tokens/_color.scss assets/scss/foundation/tokens/_font.scss
git commit -m "デザイントークンを Forest Green × Fraunces/Shippori に更新"
```

---

## Task 2: foundation base のバグ修正と container

**Files:**
- Modify: `assets/scss/foundation/_base.scss`
- Modify: `assets/scss/layout/_container.scss`
- Modify: `assets/scss/layout/_index.scss`（`_container` 未登録なら追記）

- [ ] **Step 1: `_base.scss` を修正（`m.mq()` の未定義namespaceを解消）**

`assets/scss/foundation/_base.scss` の全内容を以下に置き換える:

```scss
@use "./tokens" as t;
/*!
foundation > base
------------------------------
*/

html {
  font-size: var(--font-size-root);
  scroll-behavior: smooth;
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

body {
  font-family: var(--font-base);
  font-size: var(--font-size-base);
  line-height: var(--line-height-base);
  letter-spacing: var(--letter-spacing-base);
  color: var(--color-text-base);
  background-color: var(--color-bg-base);
  -webkit-font-smoothing: antialiased;
}

img,
picture,
svg {
  max-width: 100%;
  height: auto;
  display: block;
}

a {
  color: inherit;
  text-decoration: none;
}

::selection {
  background-color: var(--color-accent);
  color: var(--color-on-accent);
}

:focus-visible {
  outline: 2px solid var(--color-accent);
  outline-offset: 3px;
}
```

- [ ] **Step 2: `_container.scss` を中央寄せコンテナとして定義**

`assets/scss/layout/_container.scss` の全内容を以下に置き換える:

```scss
@use "../foundation" as f;

/*!
layout > container
------------------------------
*/
.l-container {
  width: 100%;
  max-width: 75rem; // 1200px
  margin-inline: auto;
  padding-inline: var(--gutter-sm);

  @include f.mq() {
    padding-inline: var(--gutter-lg);
  }
}

.l-container--wide {
  max-width: 87.5rem; // 1400px
}
```

- [ ] **Step 3: `layout/_index.scss` に `_container` が登録されているか確認し、無ければ追記**

`assets/scss/layout/_index.scss` を開き、`@use "container";` が無ければ先頭付近に追記する（既存の `@use "header";` 等と並べる）。

- [ ] **Step 4: コンパイル確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: エラー無し。

- [ ] **Step 5: Commit**

```bash
git add assets/scss/foundation/_base.scss assets/scss/layout/_container.scss assets/scss/layout/_index.scss
git commit -m "base のmqバグ修正と l-container 追加"
```

---

## Task 3: index.html の head とページ骨格

**Files:**
- Modify: `index.html`

- [ ] **Step 1: head のフォント・メタを差し替える**

`index.html` の `<head>` 内、フォント読み込み行（`<!-- font -->` 〜 `<link ... Cormorant...>`）を以下に置き換える。`<title>` と description も更新する:

```html
        <title>hiro — Web Designer &amp; Developer</title>
        <meta name="description" content="デザインから実装まで一人で。直クライアント向けに、課題を解決するWebサイトをつくるWebデザイナー hiro のポートフォリオ。" />

        <!-- font -->
        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,500&family=Shippori+Mincho:wght@400;500;600;700&display=swap" rel="stylesheet">
```

（`&display=swap` により font-display: swap が効く。）

- [ ] **Step 2: body にトップページの骨格を入れる**

`index.html` の `<body>` を以下に置き換える（各セクションの中身は後続タスクで埋めるため、この段階ではプレースホルダのコメントを入れる）:

```html
    <body>
        <header class="l-header js-header" id="top">
            <!-- Task 4 で実装 -->
        </header>
        <main>
            <section class="p-hero js-header-trigger">
                <!-- Task 5 で実装 -->
            </section>
            <section class="p-works" id="works">
                <!-- Task 6 で実装 -->
            </section>
            <section class="p-about" id="about">
                <!-- Task 7 で実装 -->
            </section>
            <section class="p-skill" id="skill">
                <!-- Task 8 で実装 -->
            </section>
            <section class="p-flow" id="flow">
                <!-- Task 9 で実装 -->
            </section>
            <section class="p-contact" id="contact">
                <!-- Task 10 で実装 -->
            </section>
        </main>
        <footer class="l-footer">
            <!-- Task 11 で実装 -->
        </footer>
    </body>
```

> 補足: `.js-header-trigger` を Hero に付けることで、既存 `header-background-toggle.js` が「Heroを抜けたらヘッダー背景を出す」挙動になる。

- [ ] **Step 3: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
さらに `python3 -m http.server 8000` を起動し `http://localhost:8000` を開く。
Expected: 紙地（#f7f5f0）の背景・明朝フォントが適用された空ページが表示される（エラー無し）。

- [ ] **Step 4: Commit**

```bash
git add index.html
git commit -m "head をFraunces/Shipporiに差し替え、トップページ骨格を追加"
```

---

## Task 4: ヘッダー（l-header）

**Files:**
- Modify: `index.html`（`<header>` 内）
- Modify: `assets/scss/layout/_header.scss`（全面書き換え）
- Modify: `assets/scss/component/_logo.scss`（トークン整合）

PC はインラインナビ、モバイルは既存 `hamburger-menu.js`（`<dialog>` + `.js-header-menu` / `.js-header-menu-open` / `.js-header-menu-close`）を使う。

- [ ] **Step 1: `<header>` のマークアップ**

`index.html` の `<header class="l-header js-header" id="top">` の中身を以下に置き換える:

```html
            <div class="l-header__inner">
                <a href="#top" class="c-site-logo">
                    <span class="c-site-logo__main">hiro<span class="c-site-logo__dot">.</span></span>
                    <span class="c-site-logo__sub">Web Designer &amp; Developer</span>
                </a>

                <button type="button" class="l-header__burger js-header-menu-open" aria-label="メニューを開く">
                    <span></span><span></span>
                </button>

                <dialog class="l-header__menu js-header-menu" aria-label="ナビゲーション">
                    <button type="button" class="l-header__menu-close js-header-menu-close" aria-label="メニューを閉じる">×</button>
                    <nav class="l-header__nav">
                        <ul class="l-header__list">
                            <li><a href="#works" class="l-header__link">Works</a></li>
                            <li><a href="#about" class="l-header__link">About</a></li>
                            <li><a href="#skill" class="l-header__link">Skill</a></li>
                            <li><a href="#flow" class="l-header__link">Flow</a></li>
                            <li><a href="#contact" class="l-header__link l-header__link--cta">Contact</a></li>
                        </ul>
                    </nav>
                </dialog>
            </div>
```

- [ ] **Step 2: `_header.scss` を書き換える**

`assets/scss/layout/_header.scss` の全内容を以下に置き換える:

```scss
@use "../foundation" as f;

/*!
layout > header
------------------------------
*/
.l-header {
  position: fixed;
  inset: 0 0 auto 0;
  z-index: var(--z-index-header, 100);
  background-color: transparent;
  transition: background-color 0.3s ease, box-shadow 0.3s ease;

  &.is-active {
    background-color: var(--color-bg-base);
    box-shadow: 0 1px 0 var(--color-border);
  }
}

.l-header__inner {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem var(--gutter-sm);

  @include f.mq() {
    padding: 1.25rem var(--gutter-lg);
  }
}

.l-header__burger {
  display: inline-flex;
  flex-direction: column;
  gap: 5px;
  width: 32px;
  padding: 6px;
  cursor: pointer;

  span {
    display: block;
    height: 2px;
    background-color: var(--color-text-base);
  }

  @include f.mq() {
    display: none;
  }
}

.l-header__menu {
  // モバイル: dialog 全画面
  width: 100%;
  max-width: 100%;
  height: 100%;
  max-height: 100%;
  margin: 0;
  padding: 0;
  border: none;
  background-color: var(--color-bg-ink);
  color: var(--color-text-invert);

  &::backdrop { background-color: rgba(0, 0, 0, 0.5); }

  @include f.mq() {
    // PC: dialog をそのままインライン表示
    display: block;
    position: static;
    width: auto;
    height: auto;
    background-color: transparent;
    color: inherit;
    &::backdrop { display: none; }
  }
}

.l-header__menu-close {
  position: absolute;
  top: 1rem;
  right: 1rem;
  font-size: 2rem;
  line-height: 1;
  cursor: pointer;
  color: inherit;

  @include f.mq() { display: none; }
}

.l-header__list {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 5rem 2rem;
  font-family: var(--font-display);
  letter-spacing: 0.08em;

  @include f.mq() {
    flex-direction: row;
    align-items: center;
    gap: 2rem;
    padding: 0;
    font-size: 0.9rem;
  }
}

.l-header__link {
  transition: opacity 0.25s ease;

  @media (any-hover: hover) {
    &:hover { opacity: 0.6; }
  }

  &--cta {
    @include f.mq() {
      background-color: var(--color-accent);
      color: var(--color-on-accent);
      padding: 0.6rem 1.1rem;
      border-radius: 999px;
    }
  }
}
```

- [ ] **Step 3: `_logo.scss` をトークン整合に修正**

`assets/scss/component/_logo.scss` の全内容を以下に置き換える（旧 `--font-family-en` / `--transition-base` を新トークンへ）:

```scss
@use "../foundation" as f;

/*!
component > logo
------------------------------
*/
.c-site-logo {
  display: inline-flex;
  flex-direction: column;
  gap: 0.15em;
  color: inherit;
  transition: opacity 0.25s ease;

  @media (any-hover: hover) {
    &:hover { opacity: 0.7; }
  }
}

.c-site-logo__main {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: clamp(1.25rem, 2vw, 1.5rem);
  letter-spacing: 0.02em;
  line-height: 1;
}

.c-site-logo__dot { color: var(--color-accent); }

.c-site-logo__sub {
  font-family: var(--font-display);
  font-size: 0.625rem;
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-text-muted);
}
```

- [ ] **Step 4: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
ブラウザで `http://localhost:8000` を再読込。
Expected: 左上にロゴ「hiro.」＋サブ、右上にPCではナビ（Contactが緑ピル）、モバイル幅ではハンバーガー。ハンバーガーをクリックで `<dialog>` メニューが開閉する（既存JSが動作）。スクロールしてHeroを抜けるとヘッダーに紙地背景が付く。

- [ ] **Step 5: Commit**

```bash
git add index.html assets/scss/layout/_header.scss assets/scss/component/_logo.scss
git commit -m "ヘッダー(l-header)を実装・ロゴをトークン整合に修正"
```

---

## Task 5: Hero（p-hero / top-kv）

**Files:**
- Modify: `index.html`（`.p-hero` 内）
- Modify: `assets/scss/page/top/_top-kv.scss`（全面書き換え）

- [ ] **Step 1: Hero のマークアップ**

`index.html` の `<section class="p-hero js-header-trigger">` の中身を以下に置き換える:

```html
                <div class="l-container p-hero__inner">
                    <p class="p-hero__eyebrow">Web Designer &amp; Developer</p>
                    <h1 class="p-hero__title">Clear ideas,<br><em>careful</em> craft.</h1>
                    <div class="p-hero__foot">
                        <p class="p-hero__lead">考えを整理し、ていねいに形にする。<br>デザインから実装まで、一人で貫いて作ります。</p>
                        <a href="#works" class="p-hero__scroll">Scroll <span>↓</span> Works</a>
                    </div>
                </div>
```

- [ ] **Step 2: `_top-kv.scss` を書き換える**

`assets/scss/page/top/_top-kv.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > top > hero
------------------------------
*/
.p-hero {
  background-color: var(--color-bg-ink);
  color: var(--color-text-invert);
  min-height: 100svh;
  display: flex;
  align-items: center;
}

.p-hero__inner {
  padding-block: 8rem 4rem;
}

.p-hero__eyebrow {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  font-weight: var(--fw-medium);
  letter-spacing: 0.3em;
  text-transform: uppercase;
  color: var(--color-accent-muted);
}

.p-hero__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-display);
  line-height: var(--lh-tight);
  letter-spacing: -0.01em;
  margin-top: 1.25rem;

  em {
    font-style: italic;
    font-weight: var(--fw-medium);
    color: var(--color-accent-muted);
  }
}

.p-hero__foot {
  display: flex;
  justify-content: space-between;
  align-items: flex-end;
  gap: 2rem;
  flex-wrap: wrap;
  margin-top: 2rem;
}

.p-hero__lead {
  font-size: var(--fs-body);
  line-height: var(--lh-base);
  color: rgba(247, 245, 240, 0.78);
  max-width: 32ch;
}

.p-hero__scroll {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent-muted);
  white-space: nowrap;

  span { display: inline-block; }
}
```

- [ ] **Step 3: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 墨色背景のフルハイトHero。Fraunces大見出し（"careful" がイタリック・緑）、左下にリード文、右下にスクロール誘導。375pxでも崩れない。

- [ ] **Step 4: Commit**

```bash
git add index.html assets/scss/page/top/_top-kv.scss
git commit -m "Hero(p-hero)を実装"
```

---

## Task 6: Works（p-works）＋ work-card / tag / section-head

**Files:**
- Modify: `index.html`（`.p-works` 内）
- Create: `assets/scss/component/_section-head.scss`
- Create: `assets/scss/component/_work-card.scss`
- Modify: `assets/scss/component/_tag.scss`（全面書き換え）
- Modify: `assets/scss/component/_index.scss`（@use 追記）
- Modify: `assets/scss/page/top/_top-work.scss`（全面書き換え）

看板「Handmade Accessory EC」を大きく → 中2案件 → 残り2案件はリスト。画像は仮に `assets/img/works/` 配下の `.webp` を参照（未配置の場合は後で差し替え。`loading="lazy"` と `width/height` を必ず付ける）。

- [ ] **Step 1: `_section-head.scss`（eyebrow＋見出し共通）を新規作成**

`assets/scss/component/_section-head.scss` を新規作成:

```scss
@use "../foundation" as f;

/*!
component > section-head
------------------------------
*/
.c-section-head {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
  margin-bottom: 2.5rem;
}

.c-section-head__label {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  font-weight: var(--fw-medium);
  letter-spacing: 0.24em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.c-section-head__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h2);
  line-height: var(--lh-tight);
  margin-top: 0.5rem;
}

.c-section-head__meta {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  letter-spacing: 0.08em;
  color: var(--color-text-muted);
  font-variant-numeric: tabular-nums;
}
```

- [ ] **Step 2: `_tag.scss` を書き換える**

`assets/scss/component/_tag.scss` の全内容を以下に置き換える:

```scss
@use "../foundation" as f;

/*!
component > tag
------------------------------
*/
.c-tag {
  display: inline-block;
  font-family: var(--font-display);
  font-size: 0.75rem;
  letter-spacing: 0.06em;
  padding: 0.4rem 0.7rem;
  border: 1px solid var(--color-border);
  border-radius: 999px;
  color: var(--color-text-muted);
}

.c-tag-list {
  display: flex;
  flex-wrap: wrap;
  gap: 0.5rem;
}
```

- [ ] **Step 3: `_work-card.scss` を新規作成**

`assets/scss/component/_work-card.scss` を新規作成:

```scss
@use "../foundation" as f;

/*!
component > work-card
------------------------------
*/
.c-work-card {
  display: block;
  color: inherit;
}

.c-work-card__shot {
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  background-color: var(--color-bg-surface);
  aspect-ratio: 16 / 10;
  transition: transform 0.35s ease, box-shadow 0.35s ease;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

@media (any-hover: hover) {
  .c-work-card:hover .c-work-card__shot {
    transform: translateY(-6px);
    box-shadow: 0 18px 40px rgba(23, 18, 14, 0.12);
  }
}

.c-work-card__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  margin-top: 0.85rem;
}

.c-work-card__cat {
  font-family: var(--font-display);
  font-size: 0.7rem;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: var(--color-text-muted);
  margin-top: 0.35rem;
}

// 看板（featured）
.c-work-card--featured {
  display: grid;
  gap: 1.5rem;

  @include f.mq() {
    grid-template-columns: 1.25fr 1fr;
    gap: 2.5rem;
    align-items: center;
  }

  .c-work-card__shot { aspect-ratio: 16 / 11; }
  .c-work-card__title { font-size: var(--fs-h2); }
}

.c-work-card__featured-meta .c-work-card__cat { margin-top: 0; }
.c-work-card__lead {
  line-height: var(--lh-base);
  color: var(--color-text-muted);
  margin: 0.75rem 0 1rem;
  max-width: 34ch;
}
.c-work-card__more {
  display: inline-block;
  font-family: var(--font-display);
  font-weight: var(--fw-medium);
  color: var(--color-accent);
}
```

- [ ] **Step 4: `component/_index.scss` に新パーツを登録**

`assets/scss/component/_index.scss` に以下2行を追記（既存の `@use "tag";` 等と並べる。重複しないよう確認）:

```scss
@use "section-head";
@use "work-card";
```

- [ ] **Step 5: Works のマークアップ**

`index.html` の `<section class="p-works" id="works">` の中身を以下に置き換える:

```html
                <div class="l-container p-works__inner">
                    <div class="c-section-head">
                        <div>
                            <p class="c-section-head__label">Selected Works</p>
                            <h2 class="c-section-head__title">作品</h2>
                        </div>
                        <p class="c-section-head__meta">2022 — 2026 / 05 projects</p>
                    </div>

                    <a href="#" class="c-work-card c-work-card--featured js-reveal">
                        <div class="c-work-card__shot">
                            <img src="assets/img/works/handmade-ec.webp" alt="Handmade Accessory EC サイトのスクリーンショット" width="800" height="550" loading="lazy">
                        </div>
                        <div class="c-work-card__featured-meta">
                            <p class="c-work-card__cat">01 — Featured · E-Commerce</p>
                            <h3 class="c-work-card__title">Handmade Accessory<br>EC Site</h3>
                            <p class="c-work-card__lead">ハンドメイドアクセサリーのECサイト。世界観の表現と購入導線の両立。</p>
                            <ul class="c-tag-list">
                                <li class="c-tag">E-Commerce</li>
                                <li class="c-tag">Design</li>
                                <li class="c-tag">Front-end</li>
                            </ul>
                            <span class="c-work-card__more">View case study →</span>
                        </div>
                    </a>

                    <ul class="p-works__grid">
                        <li>
                            <a href="#" class="c-work-card js-reveal">
                                <div class="c-work-card__shot">
                                    <img src="assets/img/works/towa.webp" alt="東和精密テック コーポレートサイトのスクリーンショット" width="600" height="375" loading="lazy">
                                </div>
                                <h3 class="c-work-card__title">東和精密テック</h3>
                                <p class="c-work-card__cat">Corporate · Design + Front-end</p>
                            </a>
                        </li>
                        <li>
                            <a href="#" class="c-work-card js-reveal">
                                <div class="c-work-card__shot">
                                    <img src="assets/img/works/coffee.webp" alt="Coffee House コーポレートサイトのスクリーンショット" width="600" height="375" loading="lazy">
                                </div>
                                <h3 class="c-work-card__title">Coffee House</h3>
                                <p class="c-work-card__cat">Corporate · Design + Front-end</p>
                            </a>
                        </li>
                    </ul>

                    <ul class="p-works__list">
                        <li class="p-works__row">
                            <a href="#" class="p-works__row-link">
                                <span class="p-works__row-no">04</span>
                                <span class="p-works__row-title">Hair Salon</span>
                                <span class="p-works__row-cat">Corporate Site</span>
                                <span class="p-works__row-view">View →</span>
                            </a>
                        </li>
                        <li class="p-works__row">
                            <a href="#" class="p-works__row-link">
                                <span class="p-works__row-no">05</span>
                                <span class="p-works__row-title">Handmade Accessory LP</span>
                                <span class="p-works__row-cat">Landing Page</span>
                                <span class="p-works__row-view">View →</span>
                            </a>
                        </li>
                    </ul>
                </div>
```

- [ ] **Step 6: `_top-work.scss` を書き換える**

`assets/scss/page/top/_top-work.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > top > works
------------------------------
*/
.p-works {
  background-color: var(--color-bg-base);
}

.p-works__inner {
  padding-block: var(--space-xl);
}

.p-works__grid {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.5rem;

  @include f.mq() {
    grid-template-columns: 1fr 1fr;
    gap: 2rem;
    margin-top: 2.5rem;
  }
}

.p-works__list {
  margin-top: 2.5rem;
  border-top: 1px solid var(--color-border);
}

.p-works__row-link {
  display: grid;
  grid-template-columns: 2rem 1fr auto;
  grid-template-areas:
    "no title view"
    "no cat   view";
  align-items: center;
  column-gap: 1rem;
  padding: 1.1rem 0;
  border-bottom: 1px solid var(--color-border);
  font-family: var(--font-display);
  transition: padding-left 0.25s ease;

  @include f.mq() {
    grid-template-columns: 2.5rem 1fr 1fr auto;
    grid-template-areas: "no title cat view";
  }

  @media (any-hover: hover) {
    &:hover { padding-left: 0.5rem; }
  }
}

.p-works__row-no { grid-area: no; color: var(--color-accent); font-weight: var(--fw-bold); }
.p-works__row-title { grid-area: title; font-weight: var(--fw-bold); }
.p-works__row-cat { grid-area: cat; color: var(--color-text-muted); font-size: var(--fs-small); }
.p-works__row-view { grid-area: view; color: var(--color-accent); font-size: var(--fs-small); }
```

- [ ] **Step 7: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 看板ECが大きく左右組み、中2案件が2カラム、残り2案件がリスト。画像が未配置なら alt とレイアウト枠（aspect-ratio）が見える。ホバーでカードが持ち上がる。375pxで1カラムに落ちる。

> 画像未配置の場合: `assets/img/works/` に `handmade-ec.webp` / `towa.webp` / `coffee.webp` を後日配置する。配置後は `/optimize-images` で最適化する。

- [ ] **Step 8: Commit**

```bash
git add index.html assets/scss/component/_section-head.scss assets/scss/component/_work-card.scss assets/scss/component/_tag.scss assets/scss/component/_index.scss assets/scss/page/top/_top-work.scss
git commit -m "Works(p-works)とwork-card/section-head/tagを実装"
```

---

## Task 7: About（p-about）

**Files:**
- Modify: `index.html`（`.p-about` 内）
- Modify: `assets/scss/page/top/_top-about.scss`（全面書き換え）

- [ ] **Step 1: About のマークアップ**

`index.html` の `<section class="p-about" id="about">` の中身を以下に置き換える:

```html
                <div class="l-container p-about__inner">
                    <div class="p-about__photo">
                        <img src="assets/img/about/portrait.webp" alt="hiro のポートレート" width="400" height="500" loading="lazy">
                    </div>
                    <div class="p-about__body js-reveal">
                        <p class="c-section-head__label">About</p>
                        <h2 class="p-about__title">なぜ、一人で<br><em>最後まで</em>作るのか。</h2>
                        <p class="p-about__text">デザインと実装を分けないことで、意図のズレなく細部まで通せます。一案件ごとに、その人らしさが伝わるサイトを目指しています。丁寧なコーディングと、見やすいデザイン、その両方を一人で。</p>
                    </div>
                </div>
```

- [ ] **Step 2: `_top-about.scss` を書き換える**

`assets/scss/page/top/_top-about.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > top > about
------------------------------
*/
.p-about {
  background-color: var(--color-bg-ink);
  color: var(--color-text-invert);
}

.p-about__inner {
  padding-block: var(--space-xl);
  display: grid;
  gap: 2rem;

  @include f.mq() {
    grid-template-columns: 280px 1fr;
    gap: 3.5rem;
    align-items: center;
  }
}

.p-about__photo {
  border-radius: var(--radius-md, 8px);
  overflow: hidden;
  background-color: var(--color-ink-700);
  aspect-ratio: 4 / 5;
  max-width: 280px;

  img { width: 100%; height: 100%; object-fit: cover; }
}

.p-about__body .c-section-head__label { color: var(--color-accent-muted); }

.p-about__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h2);
  line-height: var(--lh-tight);
  margin: 0.75rem 0 1.25rem;

  em { font-style: italic; font-weight: var(--fw-medium); color: var(--color-accent-muted); }
}

.p-about__text {
  line-height: var(--lh-base);
  color: rgba(247, 245, 240, 0.78);
  max-width: 46ch;
}
```

- [ ] **Step 3: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 墨色背景の About。左に写真枠（4:5）、右に見出し＋本文。375pxで縦積み。

- [ ] **Step 4: Commit**

```bash
git add index.html assets/scss/page/top/_top-about.scss
git commit -m "About(p-about)を実装"
```

---

## Task 8: Skill（p-skill）

**Files:**
- Modify: `index.html`（`.p-skill` 内）
- Modify: `assets/scss/page/top/_top-skill.scss`（全面書き換え）

- [ ] **Step 1: Skill のマークアップ**

`index.html` の `<section class="p-skill" id="skill">` の中身を以下に置き換える:

```html
                <div class="l-container p-skill__inner">
                    <div class="c-section-head">
                        <div>
                            <p class="c-section-head__label">Skill</p>
                            <h2 class="c-section-head__title">できること</h2>
                        </div>
                    </div>
                    <div class="p-skill__cols">
                        <div class="p-skill__col js-reveal">
                            <p class="p-skill__col-label">Design</p>
                            <h3 class="p-skill__col-title">デザイン</h3>
                            <ul class="p-skill__items">
                                <li>情報設計・ワイヤーフレーム</li>
                                <li>UIデザイン / Figma</li>
                                <li>配色・タイポグラフィ</li>
                            </ul>
                        </div>
                        <div class="p-skill__col js-reveal">
                            <p class="p-skill__col-label">Front-end</p>
                            <h3 class="p-skill__col-title">実装</h3>
                            <ul class="p-skill__items">
                                <li>HTML / CSS(SCSS) / JavaScript</li>
                                <li>レスポンシブ・パフォーマンス</li>
                                <li>GSAPによる演出</li>
                            </ul>
                        </div>
                    </div>
                </div>
```

- [ ] **Step 2: `_top-skill.scss` を書き換える**

`assets/scss/page/top/_top-skill.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > top > skill
------------------------------
*/
.p-skill { background-color: var(--color-bg-base); }

.p-skill__inner { padding-block: var(--space-xl); }

.p-skill__cols {
  display: grid;
  gap: 2rem;

  @include f.mq() {
    grid-template-columns: 1fr 1fr;
    gap: 0;
  }
}

.p-skill__col {
  padding: 2rem 0;
  border-top: 1px solid var(--color-border);

  @include f.mq() {
    padding: 0 2.5rem;
    border-top: none;
    &:first-child { border-right: 1px solid var(--color-border); padding-left: 0; }
    &:last-child { padding-right: 0; }
  }
}

.p-skill__col-label {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.p-skill__col-title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  margin: 0.5rem 0 1rem;
}

.p-skill__items {
  li {
    padding: 0.6rem 0;
    border-bottom: 1px dotted var(--color-border);
    color: var(--color-text-muted);
    line-height: var(--lh-base);
  }
}
```

- [ ] **Step 3: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: Design / Front-end の2カラム。PCは中央に区切り線、モバイルは縦積み。

- [ ] **Step 4: Commit**

```bash
git add index.html assets/scss/page/top/_top-skill.scss
git commit -m "Skill(p-skill)を実装"
```

---

## Task 9: Flow（p-flow）

**Files:**
- Modify: `index.html`（`.p-flow` 内）
- Modify: `assets/scss/page/top/_top-flow.scss`（全面書き換え）

- [ ] **Step 1: Flow のマークアップ**

`index.html` の `<section class="p-flow" id="flow">` の中身を以下に置き換える:

```html
                <div class="l-container p-flow__inner">
                    <div class="c-section-head">
                        <div>
                            <p class="c-section-head__label">Flow</p>
                            <h2 class="c-section-head__title">制作の流れ</h2>
                        </div>
                    </div>
                    <ol class="p-flow__steps">
                        <li class="p-flow__step js-reveal"><span class="p-flow__no">01</span><span class="p-flow__name">ヒアリング</span></li>
                        <li class="p-flow__step js-reveal"><span class="p-flow__no">02</span><span class="p-flow__name">設計・構成</span></li>
                        <li class="p-flow__step js-reveal"><span class="p-flow__no">03</span><span class="p-flow__name">デザイン</span></li>
                        <li class="p-flow__step js-reveal"><span class="p-flow__no">04</span><span class="p-flow__name">実装</span></li>
                        <li class="p-flow__step js-reveal"><span class="p-flow__no">05</span><span class="p-flow__name">公開・運用</span></li>
                    </ol>
                </div>
```

- [ ] **Step 2: `_top-flow.scss` を書き換える**

`assets/scss/page/top/_top-flow.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > top > flow
------------------------------
*/
.p-flow { background-color: var(--color-bg-subtle); }

.p-flow__inner { padding-block: var(--space-xl); }

.p-flow__steps {
  display: grid;
  gap: 1rem;

  @include f.mq() {
    grid-template-columns: repeat(5, 1fr);
  }
}

.p-flow__step {
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border);
  border-radius: var(--radius-md, 8px);
  padding: 1.25rem;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.p-flow__no {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  color: var(--color-accent);
}

.p-flow__name { font-size: var(--fs-small); }
```

- [ ] **Step 3: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 紙地のひとつ濃い面に5ステップ。PCは横5列、モバイルは縦積み。

- [ ] **Step 4: Commit**

```bash
git add index.html assets/scss/page/top/_top-flow.scss
git commit -m "Flow(p-flow)を実装"
```

---

## Task 10: Contact CTA（p-contact）＋ c-button

**Files:**
- Modify: `index.html`（`.p-contact` 内）
- Modify: `assets/scss/component/_button.scss`（トークン整合）
- Modify: `assets/scss/page/top/_top-contact.scss`（全面書き換え）

フォーム本体は置かず、`mailto:` ボタン＋SNSリンクのみ（spec通り）。

- [ ] **Step 1: Contact のマークアップ**

`index.html` の `<section class="p-contact" id="contact">` の中身を以下に置き換える（メールアドレスは実際のものに差し替え可）:

```html
                <div class="l-container p-contact__inner js-reveal">
                    <p class="p-contact__label">Contact</p>
                    <h2 class="p-contact__title">Let’s build something <em>careful.</em></h2>
                    <p class="p-contact__lead">Webサイトの相談・お見積もり、お気軽にどうぞ。</p>
                    <a href="mailto:n.y.h.051216@gmail.com" class="c-button c-button--on-accent">お問い合わせ →</a>
                    <ul class="p-contact__sns">
                        <li><a href="https://github.com/" target="_blank" rel="noopener">GitHub</a></li>
                        <li><a href="https://x.com/" target="_blank" rel="noopener">X</a></li>
                    </ul>
                </div>
```

- [ ] **Step 2: `_button.scss` をトークン整合に書き換える**

`assets/scss/component/_button.scss` の全内容を以下に置き換える（旧 `--color-main` / `--radius-round` / `--transition-base` を解消）:

```scss
@use "../foundation" as f;

/*!
component > button
------------------------------
*/
.c-button {
  display: inline-flex;
  justify-content: center;
  align-items: center;
  min-width: 12.5rem;
  padding: 0.9rem 2rem;
  border-radius: 999px;
  background-color: var(--color-accent);
  color: var(--color-on-accent);
  font-family: var(--font-display);
  font-size: var(--fs-body);
  font-weight: var(--fw-medium);
  line-height: 1;
  transition: transform 0.25s ease, opacity 0.25s ease;

  @media (any-hover: hover) {
    &:hover { opacity: 0.92; transform: translateY(-2px); }
  }
}

// 緑面の上に置く反転ボタン（紙地ボタン＋緑文字）
.c-button--on-accent {
  background-color: var(--color-paper);
  color: var(--color-accent);
}
```

- [ ] **Step 3: `_top-contact.scss` を書き換える**

`assets/scss/page/top/_top-contact.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > top > contact
------------------------------
*/
.p-contact { background-color: var(--color-accent); color: var(--color-on-accent); }

.p-contact__inner {
  padding-block: var(--space-xl);
  text-align: center;
}

.p-contact__label {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  letter-spacing: 0.26em;
  text-transform: uppercase;
  opacity: 0.75;
}

.p-contact__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h2);
  line-height: var(--lh-tight);
  margin: 1rem 0;

  em { font-style: italic; font-weight: var(--fw-medium); }
}

.p-contact__lead {
  line-height: var(--lh-base);
  opacity: 0.85;
  margin-bottom: 2rem;
}

.p-contact__sns {
  display: flex;
  justify-content: center;
  gap: 2rem;
  margin-top: 1.75rem;
  font-family: var(--font-display);
  letter-spacing: 0.1em;

  a { opacity: 0.85; transition: opacity 0.25s ease; }
  @media (any-hover: hover) { a:hover { opacity: 1; } }
}
```

- [ ] **Step 4: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 深緑バンドのContact。中央にFraunces見出し（careful がイタリック）、紙地ボタン、GitHub/X。ボタンクリックでメーラー起動。

- [ ] **Step 5: Commit**

```bash
git add index.html assets/scss/component/_button.scss assets/scss/page/top/_top-contact.scss
git commit -m "Contact CTA(p-contact)とc-buttonを実装"
```

---

## Task 11: Footer（l-footer）

**Files:**
- Modify: `index.html`（`<footer>` 内）
- Modify: `assets/scss/layout/_footer.scss`（全面書き換え）

- [ ] **Step 1: Footer のマークアップ**

`index.html` の `<footer class="l-footer">` の中身を以下に置き換える:

```html
            <div class="l-container l-footer__inner">
                <a href="#top" class="l-footer__logo">hiro<span>.</span></a>
                <ul class="l-footer__nav">
                    <li><a href="#works">Works</a></li>
                    <li><a href="#about">About</a></li>
                    <li><a href="#contact">Contact</a></li>
                    <li><a href="privacy/index.html">Privacy</a></li>
                </ul>
                <small class="l-footer__copy">© 2026 hiro</small>
            </div>
```

- [ ] **Step 2: `_footer.scss` を書き換える**

`assets/scss/layout/_footer.scss` の全内容を以下に置き換える:

```scss
@use "../foundation" as f;

/*!
layout > footer
------------------------------
*/
.l-footer {
  background-color: var(--color-bg-ink);
  color: var(--color-text-invert);
}

.l-footer__inner {
  padding-block: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;

  @include f.mq() {
    flex-direction: row;
    align-items: center;
    justify-content: space-between;
  }
}

.l-footer__logo {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: 1.25rem;
  span { color: var(--color-accent-muted); }
}

.l-footer__nav {
  display: flex;
  gap: 1.5rem;
  font-family: var(--font-display);
  font-size: var(--fs-small);
  letter-spacing: 0.06em;

  a { opacity: 0.7; transition: opacity 0.25s ease; }
  @media (any-hover: hover) { a:hover { opacity: 1; } }
}

.l-footer__copy {
  font-size: 0.75rem;
  opacity: 0.5;
}
```

- [ ] **Step 3: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: 墨色フッター。ロゴ・ナビ・コピーライト。375pxで縦積み。

- [ ] **Step 4: Commit**

```bash
git add index.html assets/scss/layout/_footer.scss
git commit -m "Footer(l-footer)を実装"
```

---

## Task 12: JSアニメーション（スクロールリベール）と main.js 整理

**Files:**
- Create: `assets/js/component/scroll-reveal.js`
- Modify: `assets/js/main.js`

既存 `main.js` は別案件の slider/staff import を含むため整理する。`.js-reveal` 要素を ScrollTrigger でフェードイン。`prefers-reduced-motion: reduce` の場合はアニメーションせず即表示（spec 8章準拠）。

- [ ] **Step 1: `scroll-reveal.js` を新規作成**

`assets/js/component/scroll-reveal.js` を新規作成:

```js
/**
 * スクロール連動フェードイン
 * .js-reveal を下からふわっと表示。reduced-motion 時は即表示。
 */
export const initializeScrollReveal = () => {
  const targets = document.querySelectorAll('.js-reveal');
  if (!targets.length) return;

  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || typeof gsap === 'undefined') {
    targets.forEach((el) => { el.style.opacity = '1'; });
    return;
  }

  targets.forEach((el) => {
    gsap.fromTo(
      el,
      { opacity: 0, y: 24 },
      {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: 'power2.out',
        scrollTrigger: {
          trigger: el,
          start: 'top 85%',
        },
      },
    );
  });
};
```

- [ ] **Step 2: `main.js` を整理して新演出を初期化**

`assets/js/main.js` の全内容を以下に置き換える（このトッププランで使わない gallery/staff slider・form の import を削除）:

```js
import { initializeHamburgerMenu } from "./component/hamburger-menu.js";
import { initializeHeaderBackgroundToggle } from "./component/header-background-toggle.js";
import { initializeScrollReveal } from "./component/scroll-reveal.js";

initializeHamburgerMenu();
initializeHeaderBackgroundToggle();
initializeScrollReveal();
```

> 注: `header-background-toggle.js` は `.js-header` と `.js-header-trigger` を参照する。Task 3/4 で `<header class="... js-header">` と Hero の `js-header-trigger` を付与済み。

- [ ] **Step 3: 表示確認（コンパイル不要・JSのみ）**

`http://localhost:8000` を再読込し、スクロールする。
Expected: 各セクションの `.js-reveal` 要素が下からフェードインする。OSの「視差効果を減らす」をONにすると即表示になる（アニメーション無し）。コンソールエラーが無い。

- [ ] **Step 4: Commit**

```bash
git add assets/js/component/scroll-reveal.js assets/js/main.js
git commit -m "スクロールリベール演出を追加しmain.jsを整理"
```

---

## Task 13: レスポンシブ・アクセシビリティ・最終レビュー

**Filesः**
- Modify: 必要に応じて各 SCSS / HTML（レビュー指摘の修正）

- [ ] **Step 1: ブレークポイント横断で目視確認**

`http://localhost:8000` を DevTools で 375 / 768 / 1024 / 1440px で確認:
- 横スクロールが発生しない
- Hero・Works看板・About・Skill・Flow が各幅で破綻しない
- ヘッダー: モバイルでハンバーガー、PCでインラインナビ

- [ ] **Step 2: アクセシビリティ確認（spec 8章）**

- すべてのリンク/ボタンに `cursor: pointer`（`a`/`button` は既定でOK、`.l-header__burger`/`.l-header__menu-close` に付与済み）
- キーボード Tab でフォーカスリング（`:focus-visible`）が見える
- 見出し階層が h1(Hero) → h2(各セクション) → h3 の順
- 画像に意味のある `alt`
- コントラスト: 墨色/紙地、緑/紙地白文字が 4.5:1 以上（ブラウザのDevTools か https://webaim.org/resources/contrastchecker/ で `#17120e` on `#f7f5f0`、`#f7f5f0` on `#2f4a3a` を確認）

- [ ] **Step 3: 内部リンク整合チェック**

`/check-links` スキルを実行し、`#works` 等のアンカーと `privacy/index.html` 参照に壊れが無いか確認（privacyページ未作成の場合は別プランで作成予定として記録）。

- [ ] **Step 4: SCSS / HTML レビュー**

`/scss-review` と `/html-review` を実行し、指摘を修正する。修正後は再コンパイルしてエラー無しを確認:
Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`

- [ ] **Step 5: 最終コミット**

```bash
git add -A
git commit -m "トップページのレスポンシブ・a11y最終調整"
```

---

## Self-Review メモ（プラン作成者による確認済み）

- **Spec coverage**: 配色/フォント(Task1) ・トンマナ反映(Hero/各セクション) ・トップ構成6セクション+Header/Footer(Task3-11) ・軽いCTA(Task10) ・既存JS活用とmain.js整理(Task12) ・実装ガードレール(reduced-motion=Task12, font-display=Task3, lazy/aspect-ratio=Task6/7, focus/contrast=Task13) を網羅。詳細ページ/privacy はフォローアッププランへ明示的に分離。
- **Type/トークン consistency**: 全セクションが semantic トークン（--color-bg-base/-ink/-subtle, --color-accent(-muted/-hover), --color-on-accent, --color-text-base/-muted/-invert, --color-border, --font-display/-base, --fs-*, --fw-*, --lh-*, --space-*, --gutter-*）のみを使用。旧不整合トークン(--color-main/-orange/-gray, --radius-round, --transition-base, --font-family-*)に依存するファイルは Task0 で削除、または Task4(logo)/Task10(button) で新トークンに全面書き換え。互換エイリアスは持たない。
- **既知の前提**: 作品画像/ポートレートは `assets/img/works/`・`assets/img/about/` に未配置の可能性。レイアウトは aspect-ratio で枠が保たれるため未配置でも検証可能。配置後 `/optimize-images` で最適化。
