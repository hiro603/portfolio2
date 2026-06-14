# LIGNE — handmade accessory

ハンドメイドアクセサリーブランド「LIGNE」のコーポレートサイト。

## 使用技術

- HTML5
- SCSS（BEM記法）
- JavaScript（ES Modules）
- GSAP（スクロールアニメーション）
- Splide.js（スライダー）

## ディレクトリ構成

```
ligne/
├── index.html
├── assets/
│   ├── css/          # コンパイル済みCSS
│   ├── scss/
│   │   ├── style.scss
│   │   ├── foundation/   # リセット・変数・Mixin
│   │   ├── layout/       # ヘッダー・フッター・コンテナ
│   │   ├── component/    # 再利用パーツ
│   │   ├── page/         # ページ固有スタイル
│   │   └── utility/      # ユーティリティ
│   ├── js/
│   │   ├── main.js
│   │   ├── component/    # UI部品（ハンバーガー等）
│   │   ├── slider/       # スライダー初期化
│   │   └── vendor/       # GSAP
│   └── img/
│       ├── items/        # 商品画像
│       ├── icon/         # 装飾素材
│       └── favicon/
```

## 開発環境

SCSSのコンパイルには任意のコンパイラを使用してください。

```bash
# 例：Dart Sass
sass --watch assets/scss/style.scss:assets/css/style.css
```

## デザイン方針

- モバイルファースト（`min-width` メディアクエリ）
- デザイントークン2層構造（primitive / semantic）
- BEM記法によるクラス命名
