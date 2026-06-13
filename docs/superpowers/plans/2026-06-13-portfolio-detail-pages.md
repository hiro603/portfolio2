# ポートフォリオ刷新 — 下層ページ（ケーススタディ＋privacy）実装プラン

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development to implement this plan task-by-task. Steps use checkbox (`- [ ]`). 実装は `~/.claude/skills/web-coding/SKILL.md` の命名規則に従う。トップページ実装（`2026-06-13-portfolio-top-page.md`）が完了済みで、その design system（トークン・`c-section-head`・`c-tag`・`c-button`・`l-container`・`l-header`/`l-footer`）を再利用する前提。

**Goal:** works 詳細（ケーススタディ）5ページと privacy ページを、トップと同じ design system で実装する。看板 Handmade Accessory EC はフル構成、残り4件はリーン3ブロック構成。

**Architecture:** 静的サイトなのでテンプレート機構が無い。ヘッダー/フッターは各ページに複製（サブフォルダ `works/<slug>/` から見て `../../` のパスに調整）。詳細KVは墨色（`--color-bg-ink`）バンドにしてトップHeroと統一し、固定ヘッダーの可読性（透明時=反転色）を成立させる。`.js-header-trigger` をKVに付け、既存の `header-background-toggle.js` で「KVを抜けたらヘッダー紙地化」を再利用。別案件由来の `page/detail/*` 旧partialは削除し、クリーンな detail partial 群に再構成する。

**Tech Stack:** HTML / SCSS(FLOCSS×BEM) / 既存 JS。ビルド: `sass assets/scss/style.scss assets/css/style.css --no-source-map`。

**設計の出典:** `docs/superpowers/specs/2026-06-13-portfolio-renewal-design.md`（section 6）。

---

## 共通の検証方法
- **コンパイル**: `sass assets/scss/style.scss assets/css/style.css --no-source-map` がエラー無し。
- **目視**: リポジトリ直下で `python3 -m http.server 8000` →
  `http://localhost:8000/works/handmade-ec/` 等を 375 / 768 / 1024 / 1440px で確認。
- 画像（`assets/img/works/*.webp` 等）は未配置でOK（aspect-ratio で枠が保たれる）。

## ページURLと作品リスト（prev/next の順）
1. `works/handmade-ec/index.html` — Handmade Accessory EC（**フル**）
2. `works/towa/index.html` — 東和精密テック株式会社（リーン）
3. `works/coffee/index.html` — Coffee House（リーン）
4. `works/hair-salon/index.html` — Hair Salon（リーン）
5. `works/handmade-lp/index.html` — Handmade Accessory LP（リーン）

`privacy/index.html` — プライバシーポリシー。

---

## File Structure

**削除（別案件由来の旧 detail partial — Task 1）**
- `assets/scss/page/detail/_detail-client.scss` / `_detail-target.scss` / `_detail-problem.scss` / `_detail-objective.scss` / `_detail-solution.scss` / `_detail-design.scss` / `_detail-development.scss` / `_detail-flow.scss` / `_detail-result.scss` / `_detail-point.scss` / `_detail-overview.scss`

**作成・変更（SCSS）**
- `assets/scss/page/detail/_detail-kv.scss` — ケーススタディKV（全面書き換え）
- `assets/scss/page/detail/_detail-section.scss` — 本文セクション共通ブロック（新規）
- `assets/scss/page/detail/_detail-nav.scss` — prev/next＋Worksへ戻る（新規）
- `assets/scss/page/detail/_index.scss` — 上記3つだけを @use する形に書き換え
- `assets/scss/page/privacy/_privacy.scss` — 新トークンで全面書き換え
- `assets/scss/component/_breadcrumb.scss` — トークン整合（`#ddd`等の解消／確認）
- `assets/scss/component/_table.scss` — トークン整合（`#ddd`→`--color-border`等）
- `assets/scss/component/_index.scss` — `breadcrumb` と `table` を @use 追記

**作成（HTML）**
- `works/handmade-ec/index.html`（フル）
- `works/towa/index.html` / `works/coffee/index.html` / `works/hair-salon/index.html` / `works/handmade-lp/index.html`（リーン）
- `privacy/index.html`

**変更（HTML）**
- `index.html` — トップの Works リンク（現状 `href="#"`）を各詳細URLへ更新

---

## 再利用ブロック（サブフォルダ用 head / header / footer）

サブフォルダ（`works/<slug>/` と `privacy/`）はルートから2階層下。アセットとリンクは `../../` を前置する。**以下のブロックを各下層ページで使い回す**（タイトル/description だけページごとに変える）。

### head（`<head>` 全体）
```html
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>__PAGE_TITLE__ — hiro</title>
        <meta name="description" content="__PAGE_DESC__" />
        <meta name="format-detection" content="telephone=no, email=no" />

        <link rel="icon" href="../../assets/img/favicon/favicon.ico" />
        <link rel="icon" href="../../assets/img/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="../../assets/img/favicon/apple-touch-icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,500&family=Shippori+Mincho:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="../../assets/css/style.css" />

        <script src="../../assets/js/vendor/gsap.min.js" defer></script>
        <script src="../../assets/js/vendor/ScrollTrigger.min.js" defer></script>
        <script type="module" src="../../assets/js/main.js"></script>

        <meta name="robots" content="noindex" />
    </head>
```

### header（`<header>` 全体・トップと同じ構造、リンクはトップへ `../../index.html#...`）
```html
        <header class="l-header js-header">
            <div class="l-header__inner">
                <a href="../../index.html" class="c-site-logo">
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
                            <li><a href="../../index.html#works" class="l-header__link">Works</a></li>
                            <li><a href="../../index.html#about" class="l-header__link">About</a></li>
                            <li><a href="../../index.html#skill" class="l-header__link">Skill</a></li>
                            <li><a href="../../index.html#flow" class="l-header__link">Flow</a></li>
                            <li><a href="../../index.html#contact" class="l-header__link l-header__link--cta">Contact</a></li>
                        </ul>
                    </nav>
                </dialog>
            </div>
        </header>
```

### footer（`<footer>` 全体）
```html
        <footer class="l-footer">
            <div class="l-container l-footer__inner">
                <a href="../../index.html" class="l-footer__logo">hiro<span>.</span></a>
                <ul class="l-footer__nav">
                    <li><a href="../../index.html#works">Works</a></li>
                    <li><a href="../../index.html#about">About</a></li>
                    <li><a href="../../index.html#contact">Contact</a></li>
                    <li><a href="../../privacy/index.html">Privacy</a></li>
                </ul>
                <small class="l-footer__copy">© 2026 hiro</small>
            </div>
        </footer>
```

---

## Task 1: 詳細用 SCSS の再構成

**Files:**
- Delete: `_detail-client/-target/-problem/-objective/-solution/-design/-development/-flow/-result/-point/-overview.scss`（page/detail配下）
- Modify: `assets/scss/page/detail/_detail-kv.scss`（全面書き換え）
- Create: `assets/scss/page/detail/_detail-section.scss`, `assets/scss/page/detail/_detail-nav.scss`
- Modify: `assets/scss/page/detail/_index.scss`
- Modify: `assets/scss/component/_breadcrumb.scss`, `assets/scss/component/_table.scss`, `assets/scss/component/_index.scss`

- [ ] **Step 1: 旧 detail partial を削除**

```bash
cd /Users/hiroshishun/portfolio2
git rm assets/scss/page/detail/_detail-client.scss assets/scss/page/detail/_detail-target.scss assets/scss/page/detail/_detail-problem.scss assets/scss/page/detail/_detail-objective.scss assets/scss/page/detail/_detail-solution.scss assets/scss/page/detail/_detail-design.scss assets/scss/page/detail/_detail-development.scss assets/scss/page/detail/_detail-flow.scss assets/scss/page/detail/_detail-result.scss assets/scss/page/detail/_detail-point.scss assets/scss/page/detail/_detail-overview.scss
```

- [ ] **Step 2: `page/detail/_index.scss` を3 partial構成に書き換え**

`assets/scss/page/detail/_index.scss` の全内容を以下に置き換える:

```scss
@use "detail-kv";
@use "detail-section";
@use "detail-nav";
```

- [ ] **Step 3: `_detail-kv.scss` を書き換え（墨色KV）**

`assets/scss/page/detail/_detail-kv.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > detail > kv
------------------------------
*/
.p-detail-kv {
  background-color: var(--color-bg-ink);
  color: var(--color-text-invert);
}

.p-detail-kv__inner {
  padding-block: 7rem 3rem;

  @include f.mq() {
    padding-block: 9rem 4rem;
  }
}

.p-detail-kv__cat {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  font-weight: var(--fw-medium);
  letter-spacing: 0.2em;
  text-transform: uppercase;
  color: var(--color-accent-muted);
  margin-top: 1.5rem;
}

.p-detail-kv__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h2);
  line-height: var(--lh-tight);
  margin: 0.5rem 0 0.75rem;
}

.p-detail-kv__lead {
  line-height: var(--lh-base);
  color: rgba(247, 245, 240, 0.78);
  max-width: 46ch;
}

.p-detail-kv__tags {
  margin-top: 1.25rem;
}

.p-detail-kv__tags .c-tag {
  color: var(--color-text-invert);
  border-color: var(--color-border-invert);
}

.p-detail-kv__shot {
  margin-top: 2.5rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  background-color: var(--color-ink-700);
  aspect-ratio: 16 / 9;

  img { width: 100%; height: 100%; object-fit: cover; }
}
```

- [ ] **Step 4: `_detail-section.scss` を新規作成（本文ブロック共通）**

`assets/scss/page/detail/_detail-section.scss` を新規作成:

```scss
@use "../../foundation" as f;

/*!
page > detail > section
------------------------------
*/
.p-detail-body {
  background-color: var(--color-bg-base);
}

.p-detail-body__inner {
  padding-block: var(--space-xl);
  max-width: var(--content-width-md);
  margin-inline: auto;
}

.p-detail-section {
  & + & { margin-top: 3.5rem; }
}

.p-detail-section__label {
  font-family: var(--font-display);
  font-size: var(--fs-small);
  font-weight: var(--fw-medium);
  letter-spacing: 0.22em;
  text-transform: uppercase;
  color: var(--color-accent);
}

.p-detail-section__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  margin: 0.4rem 0 1rem;
}

.p-detail-section__text {
  line-height: var(--lh-base);
  color: var(--color-text-base);

  & + & { margin-top: 1rem; }
}

.p-detail-section__figure {
  margin-top: 1.5rem;
  border-radius: var(--radius-md);
  overflow: hidden;
  border: 1px solid var(--color-border);
  background-color: var(--color-bg-surface);
  aspect-ratio: 16 / 10;

  img { width: 100%; height: 100%; object-fit: cover; }
}

.p-detail-section__cols {
  display: grid;
  gap: 1.5rem;
  margin-top: 1.5rem;

  @include f.mq() {
    grid-template-columns: 1fr 1fr;
  }
}

.p-detail-body__inner > .c-button {
  margin-top: 2.5rem;
}
```

- [ ] **Step 5: `_detail-nav.scss` を新規作成（prev/next＋戻る）**

`assets/scss/page/detail/_detail-nav.scss` を新規作成:

```scss
@use "../../foundation" as f;

/*!
page > detail > nav
------------------------------
*/
.p-detail-nav {
  background-color: var(--color-bg-subtle);
  border-top: 1px solid var(--color-border);
}

.p-detail-nav__inner {
  padding-block: var(--space-lg);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  flex-wrap: wrap;
}

.p-detail-nav__link {
  font-family: var(--font-display);
  font-weight: var(--fw-medium);
  color: var(--color-accent);
  transition: opacity 0.25s ease;

  @media (any-hover: hover) {
    &:hover { opacity: 0.7; }
  }
}

.p-detail-nav__back {
  font-family: var(--font-display);
  letter-spacing: 0.1em;
  text-transform: uppercase;
  font-size: var(--fs-small);
}
```

- [ ] **Step 6: `_breadcrumb.scss` をトークン整合に確認・修正**

`assets/scss/component/_breadcrumb.scss` を開き、`var(--transition-base)` が `assets/scss/foundation/tokens/_transition.scss` に定義されているか確認する。定義済みならそのまま。未定義なら `transition: opacity 0.25s ease;` に置換する。他はトークン参照（`--space-sm` / `--color-text-base`）で問題ないため変更不要。

- [ ] **Step 7: `_table.scss` をトークン整合に書き換え**

`assets/scss/component/_table.scss` の全内容を以下に置き換える（`#ddd` をトークンへ）:

```scss
@use "../foundation" as f;

.c-table { width: 100%; }

.c-table table {
  width: 100%;
  border-collapse: collapse;
}

.c-table th,
.c-table td {
  padding: 0.9rem 0.5rem;
  border-bottom: 1px solid var(--color-border);
  text-align: left;
  line-height: var(--lh-base);
  vertical-align: top;
}

.c-table th {
  width: 32%;
  font-family: var(--font-display);
  font-weight: var(--fw-medium);
  letter-spacing: 0.04em;
  color: var(--color-text-muted);
  white-space: nowrap;
}
```

- [ ] **Step 8: `component/_index.scss` に breadcrumb / table を追記**

`assets/scss/component/_index.scss` に以下を追記（既存の `@use` 群と並べる。重複しないこと）:

```scss
@use "breadcrumb";
@use "table";
```

- [ ] **Step 9: コンパイル確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
Expected: エラー無し。

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "詳細ページ用SCSSを再構成（旧detail partial削除・kv/section/nav追加・breadcrumb/table整合）"
```

---

## Task 2: 看板フルケーススタディ `works/handmade-ec/index.html`

**Files:**
- Create: `works/handmade-ec/index.html`

仕様 section 6 のフル構成：KV / Overview(表) / Client&Target / Problem&Objective / Solution / Design / Development / Result&Point / CTA。`__PAGE_TITLE__`=「Handmade Accessory EC」, `__PAGE_DESC__`=「ハンドメイドアクセサリーのECサイト制作事例。世界観の表現と購入導線の両立。」として、本プラン冒頭の head/header/footer 再利用ブロックを使う。

- [ ] **Step 1: ページを新規作成**

`works/handmade-ec/index.html` を新規作成（コピーは実在の事例に合わせて後日調整可。まずはこの内容で）:

```html
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Handmade Accessory EC — hiro</title>
        <meta name="description" content="ハンドメイドアクセサリーのECサイト制作事例。世界観の表現と購入導線の両立。" />
        <meta name="format-detection" content="telephone=no, email=no" />

        <link rel="icon" href="../../assets/img/favicon/favicon.ico" />
        <link rel="icon" href="../../assets/img/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="../../assets/img/favicon/apple-touch-icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,500&family=Shippori+Mincho:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="../../assets/css/style.css" />

        <script src="../../assets/js/vendor/gsap.min.js" defer></script>
        <script src="../../assets/js/vendor/ScrollTrigger.min.js" defer></script>
        <script type="module" src="../../assets/js/main.js"></script>

        <meta name="robots" content="noindex" />
    </head>
    <body>
        <header class="l-header js-header">
            <div class="l-header__inner">
                <a href="../../index.html" class="c-site-logo">
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
                            <li><a href="../../index.html#works" class="l-header__link">Works</a></li>
                            <li><a href="../../index.html#about" class="l-header__link">About</a></li>
                            <li><a href="../../index.html#skill" class="l-header__link">Skill</a></li>
                            <li><a href="../../index.html#flow" class="l-header__link">Flow</a></li>
                            <li><a href="../../index.html#contact" class="l-header__link l-header__link--cta">Contact</a></li>
                        </ul>
                    </nav>
                </dialog>
            </div>
        </header>

        <main>
            <section class="p-detail-kv js-header-trigger">
                <div class="l-container p-detail-kv__inner">
                    <nav class="c-breadcrumb" aria-label="パンくず">
                        <ol class="c-breadcrumb-list">
                            <li class="c-breadcrumb-item"><a href="../../index.html" class="c-breadcrumb-item-link">Home</a></li>
                            <li class="c-breadcrumb-item"><a href="../../index.html#works" class="c-breadcrumb-item-link">Works</a></li>
                            <li class="c-breadcrumb-item">Handmade Accessory EC</li>
                        </ol>
                    </nav>
                    <p class="p-detail-kv__cat">Case Study — E-Commerce</p>
                    <h1 class="p-detail-kv__title">Handmade Accessory<br>EC Site</h1>
                    <p class="p-detail-kv__lead">ハンドメイドアクセサリー作家のためのECサイト。作品の世界観を伝えながら、迷わず購入まで進める導線を設計しました。</p>
                    <ul class="c-tag-list p-detail-kv__tags">
                        <li class="c-tag">E-Commerce</li>
                        <li class="c-tag">Design</li>
                        <li class="c-tag">Front-end</li>
                    </ul>
                    <div class="p-detail-kv__shot">
                        <img src="../../assets/img/works/handmade-ec.webp" alt="Handmade Accessory EC サイトのキービジュアル" width="1280" height="720" loading="eager">
                    </div>
                </div>
            </section>

            <section class="p-detail-body">
                <div class="p-detail-body__inner">

                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Overview</p>
                        <h2 class="p-detail-section__title">概要</h2>
                        <div class="c-table">
                            <table>
                                <tbody>
                                    <tr><th>クライアント</th><td>ハンドメイドアクセサリー作家（個人事業主）</td></tr>
                                    <tr><th>種別</th><td>ECサイト</td></tr>
                                    <tr><th>担当範囲</th><td>情報設計 / デザイン / フロントエンド実装</td></tr>
                                    <tr><th>期間</th><td>約2ヶ月</td></tr>
                                    <tr><th>使用技術</th><td>HTML / CSS(SCSS) / JavaScript</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </div>

                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Client &amp; Target</p>
                        <h2 class="p-detail-section__title">クライアントとターゲット</h2>
                        <p class="p-detail-section__text">一点もののアクセサリーを制作する作家さん。これまでSNSと外部マーケットのみで販売しており、自分の世界観をまとめて見せられる場を求めていました。</p>
                        <p class="p-detail-section__text">ターゲットは、量産品ではなく「作り手の想いが乗ったもの」を選びたい20〜40代の女性。スマートフォンでの閲覧・購入が中心です。</p>
                    </div>

                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Problem &amp; Objective</p>
                        <h2 class="p-detail-section__title">課題と目標</h2>
                        <p class="p-detail-section__text">外部マーケットでは作品が他の出品物に埋もれ、世界観が伝わりにくい。また購入動線が分散し、ファンを育てづらい状態でした。</p>
                        <p class="p-detail-section__text">目標は「作品の世界観を一目で伝える」「スマホで迷わず購入まで進める」の2点に設定しました。</p>
                    </div>

                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Solution</p>
                        <h2 class="p-detail-section__title">解決アプローチ</h2>
                        <p class="p-detail-section__text">余白とビジュアルを大きく取り、作品写真を主役にした構成に。トップから商品一覧・商品詳細・カートまでの導線を最短化し、各ページに次の行動を1つだけ明確に置きました。</p>
                        <div class="p-detail-section__figure">
                            <img src="../../assets/img/works/handmade-ec-flow.webp" alt="購入導線の設計図" width="800" height="500" loading="lazy">
                        </div>
                    </div>

                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Design</p>
                        <h2 class="p-detail-section__title">デザインの工夫</h2>
                        <p class="p-detail-section__text">作品の繊細さに合わせ、低彩度の配色と明朝系の見出しで上品さを演出。写真が映えるよう背景はオフホワイトで統一し、装飾は最小限に抑えました。</p>
                        <div class="p-detail-section__cols">
                            <div class="p-detail-section__figure"><img src="../../assets/img/works/handmade-ec-design1.webp" alt="配色とタイポグラフィ" width="600" height="375" loading="lazy"></div>
                            <div class="p-detail-section__figure"><img src="../../assets/img/works/handmade-ec-design2.webp" alt="商品詳細のレイアウト" width="600" height="375" loading="lazy"></div>
                        </div>
                    </div>

                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Development</p>
                        <h2 class="p-detail-section__title">実装のこだわり</h2>
                        <p class="p-detail-section__text">スマホ表示を基準にモバイルファーストで実装。商品画像はWebP＋遅延読み込みで軽量化し、初期表示を速く保ちました。カート操作はページ遷移なく即時に反映されるよう調整しています。</p>
                    </div>

                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Result &amp; Point</p>
                        <h2 class="p-detail-section__title">成果とポイント</h2>
                        <p class="p-detail-section__text">公開後、サイト経由の問い合わせ・受注が生まれ、SNSから自サイトへ誘導する運用が定着しました。「世界観が伝わるようになった」と喜んでいただけたのが一番の成果です。</p>
                        <p class="p-detail-section__text">見どころは、写真主役の余白設計と、スマホでの購入導線の短さです。</p>
                    </div>

                    <a href="../../index.html#contact" class="c-button">この内容で相談する →</a>
                </div>
            </section>

            <nav class="p-detail-nav" aria-label="作品ナビゲーション">
                <div class="l-container p-detail-nav__inner">
                    <a href="../handmade-lp/index.html" class="p-detail-nav__link">← Prev</a>
                    <a href="../../index.html#works" class="p-detail-nav__back">View all works</a>
                    <a href="../towa/index.html" class="p-detail-nav__link">Next →</a>
                </div>
            </nav>
        </main>

        <footer class="l-footer">
            <div class="l-container l-footer__inner">
                <a href="../../index.html" class="l-footer__logo">hiro<span>.</span></a>
                <ul class="l-footer__nav">
                    <li><a href="../../index.html#works">Works</a></li>
                    <li><a href="../../index.html#about">About</a></li>
                    <li><a href="../../index.html#contact">Contact</a></li>
                    <li><a href="../../privacy/index.html">Privacy</a></li>
                </ul>
                <small class="l-footer__copy">© 2026 hiro</small>
            </div>
        </footer>
    </body>
</html>
```

- [ ] **Step 2: 表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`（Task1で済んでいれば変化なし）。
`python3 -m http.server 8000` → `http://localhost:8000/works/handmade-ec/` を開く。
Expected: 墨色KV（パンくず・カテゴリ・h1・リード・タグ・大画像枠）→ 紙地本文（Overview表＋各セクション、スクロールでフェードイン）→ prev/next ナビ → フッター。ヘッダーはKV上で反転色（明色）で視認でき、スクロールで紙地化。375pxで崩れない。

- [ ] **Step 3: Commit**

```bash
git add works/handmade-ec/index.html
git commit -m "看板フルケーススタディ works/handmade-ec を実装"
```

---

## Task 3: リーン4ページ

**Files:**
- Create: `works/towa/index.html`, `works/coffee/index.html`, `works/hair-salon/index.html`, `works/handmade-lp/index.html`

リーン構成＝KV（墨色・Task2と同じ構造）＋本文は「課題 / アプローチ / 成果」の3セクションのみ＋prev/nav。各ページは head/header/footer 再利用ブロックを使い、`<main>` の中身だけ差し替える。**4ファイルとも完全な内容を以下に示す**（読み飛ばし対策のため省略しない）。

prev/next の循環: handmade-ec → towa → coffee → hair-salon → handmade-lp → (handmade-ec)。

- [ ] **Step 1: `works/towa/index.html` を作成**

head の title=「東和精密テック株式会社」, description=「製造業コーポレートサイトの制作事例。信頼感の再構築と問い合わせ導線の改善。」。head/header/footer は冒頭の再利用ブロック（`__PAGE_TITLE__`/`__PAGE_DESC__` を置換）をそのまま使う。`<main>` は以下:

```html
        <main>
            <section class="p-detail-kv js-header-trigger">
                <div class="l-container p-detail-kv__inner">
                    <nav class="c-breadcrumb" aria-label="パンくず">
                        <ol class="c-breadcrumb-list">
                            <li class="c-breadcrumb-item"><a href="../../index.html" class="c-breadcrumb-item-link">Home</a></li>
                            <li class="c-breadcrumb-item"><a href="../../index.html#works" class="c-breadcrumb-item-link">Works</a></li>
                            <li class="c-breadcrumb-item">東和精密テック株式会社</li>
                        </ol>
                    </nav>
                    <p class="p-detail-kv__cat">Case Study — Corporate</p>
                    <h1 class="p-detail-kv__title">東和精密テック<br>株式会社</h1>
                    <p class="p-detail-kv__lead">製造業のコーポレートサイト。信頼感のある見せ方と、問い合わせまでの導線を整えました。</p>
                    <ul class="c-tag-list p-detail-kv__tags">
                        <li class="c-tag">Corporate</li>
                        <li class="c-tag">Design</li>
                        <li class="c-tag">Front-end</li>
                    </ul>
                    <div class="p-detail-kv__shot">
                        <img src="../../assets/img/works/towa.webp" alt="東和精密テック コーポレートサイトのキービジュアル" width="1280" height="720" loading="eager">
                    </div>
                </div>
            </section>

            <section class="p-detail-body">
                <div class="p-detail-body__inner">
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Problem</p>
                        <h2 class="p-detail-section__title">課題</h2>
                        <p class="p-detail-section__text">既存サイトが古く、企業の技術力や信頼感が伝わっていませんでした。スマホ表示も崩れ、問い合わせにつながりにくい状態でした。</p>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Approach</p>
                        <h2 class="p-detail-section__title">アプローチ</h2>
                        <p class="p-detail-section__text">落ち着いた配色と整然としたレイアウトで信頼感を再構築。事業内容と強みを整理して伝え、各ページから問い合わせへ自然に誘導する導線にしました。スマホ対応も全面的に見直しています。</p>
                        <div class="p-detail-section__figure">
                            <img src="../../assets/img/works/towa-shot.webp" alt="東和精密テック サイトの主要ページ" width="800" height="500" loading="lazy">
                        </div>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Result</p>
                        <h2 class="p-detail-section__title">成果</h2>
                        <p class="p-detail-section__text">「会社の印象が良くなった」との評価をいただき、採用・取引先双方への見せ方として機能するサイトになりました。</p>
                    </div>
                    <a href="../../index.html#contact" class="c-button">この内容で相談する →</a>
                </div>
            </section>

            <nav class="p-detail-nav" aria-label="作品ナビゲーション">
                <div class="l-container p-detail-nav__inner">
                    <a href="../handmade-ec/index.html" class="p-detail-nav__link">← Prev</a>
                    <a href="../../index.html#works" class="p-detail-nav__back">View all works</a>
                    <a href="../coffee/index.html" class="p-detail-nav__link">Next →</a>
                </div>
            </nav>
        </main>
```

- [ ] **Step 2: `works/coffee/index.html` を作成**

title=「Coffee House」, description=「カフェのコーポレートサイト制作事例。世界観の演出と来店導線。」。`<main>`:

```html
        <main>
            <section class="p-detail-kv js-header-trigger">
                <div class="l-container p-detail-kv__inner">
                    <nav class="c-breadcrumb" aria-label="パンくず">
                        <ol class="c-breadcrumb-list">
                            <li class="c-breadcrumb-item"><a href="../../index.html" class="c-breadcrumb-item-link">Home</a></li>
                            <li class="c-breadcrumb-item"><a href="../../index.html#works" class="c-breadcrumb-item-link">Works</a></li>
                            <li class="c-breadcrumb-item">Coffee House</li>
                        </ol>
                    </nav>
                    <p class="p-detail-kv__cat">Case Study — Corporate</p>
                    <h1 class="p-detail-kv__title">Coffee House</h1>
                    <p class="p-detail-kv__lead">カフェのコーポレートサイト。お店の世界観を伝え、来店につなげる見せ方にしました。</p>
                    <ul class="c-tag-list p-detail-kv__tags">
                        <li class="c-tag">Corporate</li>
                        <li class="c-tag">Design</li>
                        <li class="c-tag">Front-end</li>
                    </ul>
                    <div class="p-detail-kv__shot">
                        <img src="../../assets/img/works/coffee.webp" alt="Coffee House サイトのキービジュアル" width="1280" height="720" loading="eager">
                    </div>
                </div>
            </section>

            <section class="p-detail-body">
                <div class="p-detail-body__inner">
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Problem</p>
                        <h2 class="p-detail-section__title">課題</h2>
                        <p class="p-detail-section__text">お店の雰囲気やこだわりが、Web上で十分に伝わっていませんでした。</p>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Approach</p>
                        <h2 class="p-detail-section__title">アプローチ</h2>
                        <p class="p-detail-section__text">写真を大きく使い、温かみのある配色とゆったりした余白で空間の心地よさを表現。メニューやアクセスなど来店前に知りたい情報を分かりやすく整理しました。</p>
                        <div class="p-detail-section__figure">
                            <img src="../../assets/img/works/coffee-shot.webp" alt="Coffee House サイトの主要ページ" width="800" height="500" loading="lazy">
                        </div>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Result</p>
                        <h2 class="p-detail-section__title">成果</h2>
                        <p class="p-detail-section__text">お店の世界観が伝わるサイトになり、来店前の情報確認先として活用されています。</p>
                    </div>
                    <a href="../../index.html#contact" class="c-button">この内容で相談する →</a>
                </div>
            </section>

            <nav class="p-detail-nav" aria-label="作品ナビゲーション">
                <div class="l-container p-detail-nav__inner">
                    <a href="../towa/index.html" class="p-detail-nav__link">← Prev</a>
                    <a href="../../index.html#works" class="p-detail-nav__back">View all works</a>
                    <a href="../hair-salon/index.html" class="p-detail-nav__link">Next →</a>
                </div>
            </nav>
        </main>
```

- [ ] **Step 3: `works/hair-salon/index.html` を作成**

title=「Hair Salon」, description=「ヘアサロンのコーポレートサイト制作事例。予約導線とブランドの世界観。」。`<main>`:

```html
        <main>
            <section class="p-detail-kv js-header-trigger">
                <div class="l-container p-detail-kv__inner">
                    <nav class="c-breadcrumb" aria-label="パンくず">
                        <ol class="c-breadcrumb-list">
                            <li class="c-breadcrumb-item"><a href="../../index.html" class="c-breadcrumb-item-link">Home</a></li>
                            <li class="c-breadcrumb-item"><a href="../../index.html#works" class="c-breadcrumb-item-link">Works</a></li>
                            <li class="c-breadcrumb-item">Hair Salon</li>
                        </ol>
                    </nav>
                    <p class="p-detail-kv__cat">Case Study — Corporate</p>
                    <h1 class="p-detail-kv__title">Hair Salon</h1>
                    <p class="p-detail-kv__lead">ヘアサロンのコーポレートサイト。ブランドの世界観と予約への導線を整えました。</p>
                    <ul class="c-tag-list p-detail-kv__tags">
                        <li class="c-tag">Corporate</li>
                        <li class="c-tag">Design</li>
                        <li class="c-tag">Front-end</li>
                    </ul>
                    <div class="p-detail-kv__shot">
                        <img src="../../assets/img/works/hair-salon.webp" alt="Hair Salon サイトのキービジュアル" width="1280" height="720" loading="eager">
                    </div>
                </div>
            </section>

            <section class="p-detail-body">
                <div class="p-detail-body__inner">
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Problem</p>
                        <h2 class="p-detail-section__title">課題</h2>
                        <p class="p-detail-section__text">サロンの雰囲気が伝わらず、予約までの導線も分かりにくい状態でした。</p>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Approach</p>
                        <h2 class="p-detail-section__title">アプローチ</h2>
                        <p class="p-detail-section__text">施術イメージやスタイル写真を主役に、洗練された配色でブランド感を表現。メニュー・料金・予約ボタンを各所に配置し、迷わず予約に進めるようにしました。</p>
                        <div class="p-detail-section__figure">
                            <img src="../../assets/img/works/hair-salon-shot.webp" alt="Hair Salon サイトの主要ページ" width="800" height="500" loading="lazy">
                        </div>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Result</p>
                        <h2 class="p-detail-section__title">成果</h2>
                        <p class="p-detail-section__text">サロンの世界観が伝わり、予約導線が明確なサイトになりました。</p>
                    </div>
                    <a href="../../index.html#contact" class="c-button">この内容で相談する →</a>
                </div>
            </section>

            <nav class="p-detail-nav" aria-label="作品ナビゲーション">
                <div class="l-container p-detail-nav__inner">
                    <a href="../coffee/index.html" class="p-detail-nav__link">← Prev</a>
                    <a href="../../index.html#works" class="p-detail-nav__back">View all works</a>
                    <a href="../handmade-lp/index.html" class="p-detail-nav__link">Next →</a>
                </div>
            </nav>
        </main>
```

- [ ] **Step 4: `works/handmade-lp/index.html` を作成**

title=「Handmade Accessory LP」, description=「ハンドメイドアクセサリーのランディングページ制作事例。」。`<main>`:

```html
        <main>
            <section class="p-detail-kv js-header-trigger">
                <div class="l-container p-detail-kv__inner">
                    <nav class="c-breadcrumb" aria-label="パンくず">
                        <ol class="c-breadcrumb-list">
                            <li class="c-breadcrumb-item"><a href="../../index.html" class="c-breadcrumb-item-link">Home</a></li>
                            <li class="c-breadcrumb-item"><a href="../../index.html#works" class="c-breadcrumb-item-link">Works</a></li>
                            <li class="c-breadcrumb-item">Handmade Accessory LP</li>
                        </ol>
                    </nav>
                    <p class="p-detail-kv__cat">Case Study — Landing Page</p>
                    <h1 class="p-detail-kv__title">Handmade Accessory<br>LP</h1>
                    <p class="p-detail-kv__lead">新作コレクションのランディングページ。一画面で世界観と魅力を伝え、行動につなげる構成にしました。</p>
                    <ul class="c-tag-list p-detail-kv__tags">
                        <li class="c-tag">Landing Page</li>
                        <li class="c-tag">Design</li>
                        <li class="c-tag">Front-end</li>
                    </ul>
                    <div class="p-detail-kv__shot">
                        <img src="../../assets/img/works/handmade-lp.webp" alt="Handmade Accessory LP のキービジュアル" width="1280" height="720" loading="eager">
                    </div>
                </div>
            </section>

            <section class="p-detail-body">
                <div class="p-detail-body__inner">
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Problem</p>
                        <h2 class="p-detail-section__title">課題</h2>
                        <p class="p-detail-section__text">新作コレクションの魅力を、短時間で伝えきれる入り口が必要でした。</p>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Approach</p>
                        <h2 class="p-detail-section__title">アプローチ</h2>
                        <p class="p-detail-section__text">ファーストビューで世界観を伝え、スクロールに合わせて魅力・こだわり・行動喚起へと流れる1ページ構成に。スクロール演出で没入感を高めました。</p>
                        <div class="p-detail-section__figure">
                            <img src="../../assets/img/works/handmade-lp-shot.webp" alt="Handmade Accessory LP の全体" width="800" height="500" loading="lazy">
                        </div>
                    </div>
                    <div class="p-detail-section js-reveal">
                        <p class="p-detail-section__label">Result</p>
                        <h2 class="p-detail-section__title">成果</h2>
                        <p class="p-detail-section__text">コレクションの世界観が一気に伝わる入り口として機能し、SNS施策と組み合わせて活用されています。</p>
                    </div>
                    <a href="../../index.html#contact" class="c-button">この内容で相談する →</a>
                </div>
            </section>

            <nav class="p-detail-nav" aria-label="作品ナビゲーション">
                <div class="l-container p-detail-nav__inner">
                    <a href="../hair-salon/index.html" class="p-detail-nav__link">← Prev</a>
                    <a href="../../index.html#works" class="p-detail-nav__back">View all works</a>
                    <a href="../handmade-ec/index.html" class="p-detail-nav__link">Next →</a>
                </div>
            </nav>
        </main>
```

> 各ファイルの `<!DOCTYPE html>`〜`</head>`、`<header>…</header>`、`<footer>…</footer>` は本プラン冒頭の「再利用ブロック」を使用（title/description のみ各ページ値に置換）。`<body>` の構造は `<header>` → 上記 `<main>` → `<footer>`。

- [ ] **Step 5: コンパイル＆表示確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
4ページを順にブラウザで開き、KV→3セクション→prev/nav が表示され、prev/next リンクが循環することを確認。

- [ ] **Step 6: Commit**

```bash
git add works/towa/index.html works/coffee/index.html works/hair-salon/index.html works/handmade-lp/index.html
git commit -m "リーンケーススタディ4ページ(towa/coffee/hair-salon/handmade-lp)を実装"
```

---

## Task 4: privacy ページ＋トップのWorksリンク更新＋最終確認

**Files:**
- Modify: `assets/scss/page/privacy/_privacy.scss`（全面書き換え）
- Create: `privacy/index.html`
- Modify: `index.html`（Worksリンク更新）

- [ ] **Step 1: `_privacy.scss` を新トークンで書き換え**

`assets/scss/page/privacy/_privacy.scss` の全内容を以下に置き換える:

```scss
@use "../../foundation" as f;

/*!
page > privacy
------------------------------
*/
.p-privacy {
  background-color: var(--color-bg-base);
}

.p-privacy__inner {
  padding-block: 7rem var(--space-xl);
  max-width: var(--content-width-md);
  margin-inline: auto;

  @include f.mq() {
    padding-block: 9rem var(--space-xl);
  }
}

.p-privacy__title {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h2);
  line-height: var(--lh-tight);
  margin-bottom: 2rem;
}

.p-privacy__block {
  & + & { margin-top: 2rem; }
}

.p-privacy__heading {
  font-family: var(--font-display);
  font-weight: var(--fw-bold);
  font-size: var(--fs-h3);
  margin-bottom: 0.5rem;
}

.p-privacy__text {
  line-height: var(--lh-base);
  color: var(--color-text-base);
}
```

- [ ] **Step 2: `privacy/index.html` を作成**

`privacy/index.html` を新規作成（head/header/footer は冒頭の再利用ブロック、title=「Privacy Policy」, description=「hiro のプライバシーポリシー。」）:

```html
<!DOCTYPE html>
<html lang="ja">
    <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <title>Privacy Policy — hiro</title>
        <meta name="description" content="hiro のプライバシーポリシー。" />
        <meta name="format-detection" content="telephone=no, email=no" />

        <link rel="icon" href="../assets/img/favicon/favicon.ico" />
        <link rel="icon" href="../assets/img/favicon/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="../assets/img/favicon/apple-touch-icon.png" />

        <link rel="preconnect" href="https://fonts.googleapis.com">
        <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
        <link href="https://fonts.googleapis.com/css2?family=Fraunces:ital,opsz,wght@0,9..144,400;0,9..144,500;0,9..144,600;0,9..144,900;1,9..144,400;1,9..144,500&family=Shippori+Mincho:wght@400;500;600;700&display=swap" rel="stylesheet">
        <link rel="stylesheet" href="../assets/css/style.css" />

        <script src="../assets/js/vendor/gsap.min.js" defer></script>
        <script src="../assets/js/vendor/ScrollTrigger.min.js" defer></script>
        <script type="module" src="../assets/js/main.js"></script>

        <meta name="robots" content="noindex" />
    </head>
    <body>
        <header class="l-header js-header is-active">
            <div class="l-header__inner">
                <a href="../index.html" class="c-site-logo">
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
                            <li><a href="../index.html#works" class="l-header__link">Works</a></li>
                            <li><a href="../index.html#about" class="l-header__link">About</a></li>
                            <li><a href="../index.html#skill" class="l-header__link">Skill</a></li>
                            <li><a href="../index.html#flow" class="l-header__link">Flow</a></li>
                            <li><a href="../index.html#contact" class="l-header__link l-header__link--cta">Contact</a></li>
                        </ul>
                    </nav>
                </dialog>
            </div>
        </header>

        <main>
            <section class="p-privacy">
                <div class="l-container p-privacy__inner">
                    <nav class="c-breadcrumb" aria-label="パンくず">
                        <ol class="c-breadcrumb-list">
                            <li class="c-breadcrumb-item"><a href="../index.html" class="c-breadcrumb-item-link">Home</a></li>
                            <li class="c-breadcrumb-item">Privacy Policy</li>
                        </ol>
                    </nav>
                    <h1 class="p-privacy__title">Privacy Policy</h1>

                    <div class="p-privacy__block">
                        <h2 class="p-privacy__heading">個人情報の取り扱いについて</h2>
                        <p class="p-privacy__text">当サイトでは、お問い合わせの際にお名前・メールアドレス等の個人情報をお預かりする場合があります。取得した個人情報は、お問い合わせへの対応のみに利用し、ご本人の同意なく第三者に提供することはありません。</p>
                    </div>

                    <div class="p-privacy__block">
                        <h2 class="p-privacy__heading">アクセス解析について</h2>
                        <p class="p-privacy__text">当サイトでは、サイトの改善を目的としてアクセス解析ツールを利用する場合があります。これにより個人を特定する情報を取得することはありません。</p>
                    </div>

                    <div class="p-privacy__block">
                        <h2 class="p-privacy__heading">免責事項</h2>
                        <p class="p-privacy__text">当サイトに掲載する情報の正確性には努めますが、内容の正確性・安全性を保証するものではありません。当サイトの利用により生じた損害について、一切の責任を負いかねます。</p>
                    </div>

                    <div class="p-privacy__block">
                        <h2 class="p-privacy__heading">お問い合わせ</h2>
                        <p class="p-privacy__text">本ポリシーに関するお問い合わせは、トップページのお問い合わせ先よりご連絡ください。</p>
                    </div>
                </div>
            </section>
        </main>

        <footer class="l-footer">
            <div class="l-container l-footer__inner">
                <a href="../index.html" class="l-footer__logo">hiro<span>.</span></a>
                <ul class="l-footer__nav">
                    <li><a href="../index.html#works">Works</a></li>
                    <li><a href="../index.html#about">About</a></li>
                    <li><a href="../index.html#contact">Contact</a></li>
                    <li><a href="index.html">Privacy</a></li>
                </ul>
                <small class="l-footer__copy">© 2026 hiro</small>
            </div>
        </footer>
    </body>
</html>
```

> 注: privacy は墨色KVが無く本文が紙地から始まるため、ヘッダーに最初から `is-active`（紙地背景・墨色文字）を付与しておく。`js-header-trigger` 要素が無くてもJSは安全に何もしない（`if (!triggerElement) return;`）。privacy は `privacy/` 直下なのでパスは `../`（1階層）である点に注意（works配下の `../../` とは異なる）。

- [ ] **Step 3: トップページの Works リンクを各詳細URLへ更新**

`index.html` の Works セクション内、`href="#"` を以下のように該当ページへ更新する:
- featured（Handmade Accessory EC のカード `<a>`）→ `href="works/handmade-ec/index.html"`
- grid 1枚目（東和精密テック）→ `href="works/towa/index.html"`
- grid 2枚目（Coffee House）→ `href="works/coffee/index.html"`
- list 04（Hair Salon）の `.p-works__row-link` → `href="works/hair-salon/index.html"`
- list 05（Handmade Accessory LP）の `.p-works__row-link` → `href="works/handmade-lp/index.html"`

他の `href` は変更しない。

- [ ] **Step 4: コンパイル＆全リンク確認**

Run: `sass assets/scss/style.scss assets/css/style.css --no-source-map`
`python3 -m http.server 8000` で以下を巡回し、リンクが正しく繋がることを確認:
- トップ → 各Worksカード → 詳細ページ → パンくず/フッターでトップへ戻る → prev/next 循環
- フッター Privacy → `privacy/` → 戻る
静的チェック: `grep -rn 'href="#"' index.html` で Works の `#` placeholder が消えていること（`#works` 等のアンカーは残ってよい）。

- [ ] **Step 5: 最終 a11y/リンク静的チェック**

- 各詳細ページ・privacy で `<img>` に alt/width/height/loading あり（KV画像は `loading="eager"`、本文図は `lazy`）。
- 見出し階層: 各下層ページは h1（KVタイトル/Privacyタイトル）→ h2（各セクション）。
- パンくずは `<nav><ol>`、各ページ1つの h1。
- コントラスト: 墨色KV上の反転文字、紙地本文の墨色文字（トップで検証済みの値と同一トークン）。

- [ ] **Step 6: Commit**

```bash
git add assets/scss/page/privacy/_privacy.scss privacy/index.html index.html
git commit -m "privacyページ実装・トップのWorksリンクを詳細ページへ接続"
```

- [ ] **Step 7: コンパイル済みCSSを同期コミット**

```bash
sass assets/scss/style.scss assets/css/style.css --no-source-map
git add assets/css/style.css
git commit -m "style.cssを同期" || echo "no css change"
```

---

## Self-Review メモ（プラン作成者）

- **Spec coverage（section 6）**: フルケーススタディ（KV/Overview/Client&Target/Problem&Objective/Solution/Design/Development/Result&Point/CTA）=Task2。リーン3ブロック×4=Task3。privacy=Task4。看板=Handmade EC でフル、他リーンのハイブリッド=満たす。
- **トークン整合**: 下層ページは新semanticトークン＋既存コンポーネント（c-breadcrumb/c-table/c-tag/c-button/c-site-logo/l-header/l-footer/l-container）のみ使用。旧detail partial（旧トークン依存）は Task1 で削除。breadcrumb/table を component/_index に登録。
- **ヘッダー可読性**: 詳細KVは墨色なので透明ヘッダー（反転色）が視認可、`js-header-trigger` でスクロール後に紙地化。privacyは墨色KVが無いため `is-active` 初期付与で対応。
- **パス深さ**: works配下=2階層（`../../`）、privacy配下=1階層（`../`）。Task2/3は `../../`、Task4 privacyは `../` を使用（プラン内で明示）。
- **既知の前提**: 作品/詳細画像・favicon は未配置（aspect-ratioで枠維持）。ケーススタディ本文は代表的なプレースホルダ文面で、実際の事例に合わせ後日差し替え。
