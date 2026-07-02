# 汎用メールフォーム（PHP / PHPMailer + SMTP、mb_send_mail 切替可）

静的サイトに後付けできるメールフォーム。フォームページは静的 HTML のまま、送信だけ PHP（`submit.php`）が受ける。案件ごとの違いは `config.php` に集約。配置は `/add-mailform` コマンドが行う。

## 構成

```
mailform/
├── submit.php           送信エンドポイント（変更不要）
├── config.sample.php    → 案件で config.php にコピーして編集
├── mailform.js          クライアント側（Ajax送信 + reCAPTCHAトークン取得）→ assets/js/ へ
├── form.sample.html     フォームマークアップの参考例
├── thanks.sample.html   完了ページの雛形
└── vendor/phpmailer/    PHPMailer 6.9.3（バージョン固定・変更不要）
```

## サーバー要件

- PHP 7.4 以上（mbstring 有効）が動くサーバー（Xserver 等のレンタルサーバー）
- **Vercel / Netlify では PHP は動かない**。静的ホスティング案件では使えないので注意
- SMTP 認証情報（Xserver: サーバーパネル > メールアカウント設定）

## 動作モード（config.php で切替）

| 設定 | 値 | 挙動 |
|---|---|---|
| `transport` | `smtp` / `mail` / `file` | PHPMailer+SMTP（推奨） / mb_send_mail（SMTP設定不要・到達率はサーバー依存） / ローカル開発（`outbox/` にテキスト保存） |
| `confirm` | `false` / `true` | 送信→thanks リダイレクト / 入力→確認画面→送信 |
| `auto_reply.enabled` | `true` / `false` | 送信者宛の自動返信メール |
| `recaptcha.secret_key` | 空 / キー | 空ならハニーポットのみ / reCAPTCHA v3 併用 |
| （HTML側）`data-ajax` | `"true"` / なし | fetch でページ遷移なし送信 / 通常 POST 遷移 |

制約: `confirm: true` のときは Ajax 送信不可（`data-ajax` を外す）。確認画面は submit.php がセッション + ワンタイムトークンで描画する。

## セキュリティ（実装済み）

- サーバー側バリデーション（必須・型・文字数）と全出力のエスケープ
- ハニーポット（bot には成功を装い破棄）
- 単一行項目の改行除去（メールヘッダインジェクション対策）
- Origin/Referer チェック（`allowed_origins`）
- 確認画面フローはワンタイムトークン（CSRF対策を兼ねる）
- reCAPTCHA v3（任意・secret はサーバー側 config のみ）
- **`config.php` は SMTP パスワードを含むためコミット禁止（.gitignore 必須）**。`outbox/` も個人情報を含むため同様

CSRF トークンを入力フォーム自体に入れていないのは、フォームページが静的 HTML でサーバー側からトークンを埋め込めないため。問い合わせフォーム単体では実害が薄く、Origin チェック + ハニーポット + reCAPTCHA で補う設計。

## ローカルでの動作確認

```bash
# config.php で 'transport' => 'file' にして
php -S localhost:8080
# フォームから送信 → mailform/outbox/*.txt に管理者宛・自動返信の内容が書き出される
```

`allowed_origins` に `http://localhost:8080` を入れておくこと。

## 本番公開前チェック

- [ ] `transport` を `smtp`（または `mail`）に戻した
- [ ] 実送信テスト（自分宛）で受信・自動返信・Reply-To を確認。迷惑メールフォルダ行きなら `smtp` に切り替える
- [ ] `allowed_origins` が本番 URL になっている
- [ ] `config.php`・`outbox/` が .gitignore に入っている（FTP アップ時も outbox は上げない）
- [ ] `from` のドメインが SMTP アカウントと一致（迷惑メール判定対策）
- [ ] thanks ページは noindex のまま（検索結果に出さない）
