# DEVCO 採用LP — デザイン仕様

/ 2026-06-20 grill-me + ui-ux-pro-max で確定 /

## トンマナ

**`硬派・技術的・即決`** — ダーク × ライム × ターミナルの「技術ドキュメント」。動かない・速い・無駄がない。
最初の1秒で「エンジニア企業だ」と伝わること。

DB照合(ui-ux-pro-max):PATTERN=Minimal Single Column / STYLE=Bento Box Grid / COLOR="Code dark + run green" / TYPO="Terminal CLI Monospace (JetBrains Mono)" で裏取り済み。
唯一の注意:`AVOID = Muted colors + Low energy`。グレー多用×演出最小で沈ませない。ライムCTAと高コントラストでエネルギー死守。

## レイアウト

- 技術ドキュメント / IDE感を全体に。背景は無地(可読性優先)。
- セクション区切り = 全幅mono `// 01 ─ MISSION & VALUES ────`。`// 00`〜`// 07` と統一。番号は区切りへ移動。
- aside(見出し+リード)+ 本文の2カラム維持。container 1200 / gutter 40(sp 20)。

## フォント

- 構造/メタ = **JetBrains Mono**、内容 = **Noto Sans JP**。
- mono を拡張:eyebrow・区切りコメント・ナビ・ラベル・stat値/単位・年号・タグ・FAQ記号・jobs行ラベル。
- **mono は weight 400 固定**(太字はmono感を壊す)、letter-spacing normal、行間 1.2 前後、サイズは絞る。
- 本文/見出しはゴシック(太字OK)。サイズスケールは比率1.333で整理。

## 配色(60/30/10)

primitive → semantic の2層。HTML/コンポーネントは semantic だけ参照。

| 役割 | 値 | コントラスト(vs bg) |
|---|---|---|
| bg-base | `#0a0c0b` | — |
| bg-surface | `#101311` | — |
| text-base | `#eef2ec` | 17.3:1 |
| text-muted | `#c3ccc2` | 11.9:1 |
| text-sub | `#aab3a9` | 9.1:1 |
| text-subtle(mono meta) | `#9aa399` | 7.5:1 |
| text-faint(最小注釈) | `#7e887c` | 5.33:1 ← `#727b71`(4.47:1, AA割れ)から修正 |
| accent lime | `#c6f24e` | 15.2:1 |

- **ライム = 行動・状態限定**:CTA / アクティブタブ / 現在値(stat) / `// 0X` 番号 / hover / 開いたFAQ / is-match。
- 装飾(アイコン・矢印・avatar枠)はグレー。単色維持・10%超えない。ロゴ角マーカーのみ極小ブランド例外。
- border:セクション間の薄線は8%のままで可(`//` コメント文字が分離を担う)。**機能的区切り(FAQ項目線・テーブル行線)は 12〜14% white** に上げて視認性確保(1.17:1→約3:1)。
- ライムは据え置き(DBは緑 `#22C55E` だが `#c6f24e` は15:1でより明るく "Low energy" に有利)。

## 演出(最小・スナッピー)

- 登場:フェード + 8〜16px上移動、0.3〜0.4s ease-out、stagger浅め、一度だけ。
- hover/状態変化(tab/faq)は瞬時。ヒーローの無限グリッドは抑制(終了 or 静的)。
- `prefers-reduced-motion` で演出オフ。1ビューで動かすのは1〜2要素まで。

## セクション別

| # | セクション | 方針 |
|---|---|---|
| 00 | HERO | 右=ターミナルウィンドウ(whoami / mission / status:hiring、グレードット、ライムはプロンプト+statusのみ、静的、`</>` は隅に小さくブランドマーク) |
| 01 | MISSION | アイコングレー化 + `01`〜`04` / `value:` mono構造ラベル、カード内ライム無 |
| 02 | NUMBERS | 純mono数値 + 構造ラベル、出典は `// 2024-04` 風、stat値ライム維持・アイコングレー |
| 03 | INTERVIEW | contributor風(`@t.yamada` / `// role` タグ / `since 2021`)、矢印グレー、is-matchライム維持 |
| 04 | JOBS | タブ is-active ライム、テーブル行ラベルをmono構造キー(job.yaml風)、スタックmono、応募CTAライム |
| 05 | FAQ | 開閉記号 mono `[+]/[-]`、開いた質問ライム、項目間は12〜14%線 |
| 06 | ENTRY | lime CTA主役 / ghost従、控えめに `> ready to commit?` のmonoプロンプト |
| 07 | FOOTER | リンク/social グレー→hoverライム、`// 07`、ロゴ角マーカー維持 |

## 担当

- **HTML / CSS = Claude**(token微修正込み)。
- **JS(FAQ / 職種タブ / インタビューフィルタ / モバイルメニュー)= 本人が自作**。
  既存フックをそのまま使う:`js-*`(faq/faq-head/faq-sign/interview-tab/interview-card/job-tab/job-panel/menu-*)、`data-cat`/`data-job`/`data-filter`、状態クラス `is-active`/`is-hidden`/`is-open`/`is-match`。
  CSSの状態表現は構築済み。クラスを付け外しするだけで動く。
- 注意:`main.js` は存在しないexportをimportしてモジュールエラー中。自作JSに合わせて main.js も書き換える。ES module は `file://` 不可、サーバ経由 or デプロイで確認。
