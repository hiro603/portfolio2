# portfolio2

hiro の個人ポートフォリオ。本番 https://webhiro.com（Xserver / FTP 手動アップ）。名刺がわり運用のため全ページ noindex 維持（意図的・外さない）。

## ブランチ運用

- `main` = FTP本番。Contact は自前PHPフォーム（PHPMailer+SMTP、`contact/mailform/`、config.php は gitignore・FTP手動アップのみ）
- Netlify のコピー（`netlify` ブランチ）は 2026-11-16 に退役・削除済み。同期作業は不要

## ビルド

package.json なし。`sass assets/scss/style.scss assets/css/style.css --no-source-map`（SCSS 変更時は main で先にビルド）。

## デザイン

Forest Green `#2f4a3a` / Paper `#f7f5f0` / Ink `#17120e`、Fraunces × Shippori Mincho、FLOCSS×BEM＋2層トークン、抑制的GSAP（reduced-motion対応）。

## 禁則

- 全5案件は仮想案件として誠実表記（成果の断定・架空の顧客の声を書かない）
- 顔写真は載せない（About はブランドカード）
