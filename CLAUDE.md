# portfolio2

hiro の個人ポートフォリオ。本番 https://webhiro.com（Xserver / FTP 手動アップ）。名刺がわり運用のため全ページ noindex 維持（意図的・外さない）。

## ブランチ運用（最重要・事故源）

- `main` = FTP本番。Contact は自前PHPフォーム（PHPMailer+SMTP、`contact/mailform/`、config.php は gitignore・FTP手動アップのみ）
- `netlify` = Netlify 自動デプロイ。Contact は Netlify Forms（PHP不可）
- 両ブランチの差分は `contact/index.html` のみに保つ。**netlify→main の PR は出さない**。共通変更は main 起点 → netlify へ一方向マージ（詳細手順は memory: portfolio-branch-workflow）

## ビルド

package.json なし。`sass assets/scss/style.scss assets/css/style.css --no-source-map`（SCSS 変更時は main で先にビルド）。

## デザイン

Forest Green `#2f4a3a` / Paper `#f7f5f0` / Ink `#17120e`、Fraunces × Shippori Mincho、FLOCSS×BEM＋2層トークン、抑制的GSAP（reduced-motion対応）。

## 禁則

- 全5案件は仮想案件として誠実表記（成果の断定・架空の顧客の声を書かない）
- 顔写真は載せない（About はブランドカード）
