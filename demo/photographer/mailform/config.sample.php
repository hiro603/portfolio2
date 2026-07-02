<?php

// 案件ごとにこのファイルを config.php にコピーして値を埋める。
// config.php は SMTP パスワードを含むため必ず .gitignore に入れる（コミット禁止）。

return [
    // サイト名（メール件名・自動返信の署名に使う）
    'site_name' => 'サンプルサイト',

    // フォーム設置ページのオリジン。ここに無い Origin/Referer からの POST は拒否する。
    // 空配列にするとチェックを行わない（非推奨）。
    'allowed_origins' => [
        'https://example.com',
        'http://localhost:8080',
    ],

    // 受信先（クライアントの受付アドレス）
    'to' => 'info@example.com',

    // 送信元。SMTP 認証ユーザーと同一ドメインのアドレスにする（なりすまし判定を避ける）
    'from' => [
        'address' => 'noreply@example.com',
        'name'    => 'サンプルサイト',
    ],

    // 管理者宛メールの件名
    'subject' => '【サンプルサイト】お問い合わせがありました',

    // 'smtp' = PHPMailer + SMTP（推奨・到達率が安定）
    // 'mail' = mb_send_mail（サーバーの sendmail に委ねる。SMTP 設定不要だが到達率はサーバー依存。smtp セクションは未使用になる）
    // 'file' = ローカル開発用（送信せず outbox/ にテキスト保存）
    'transport' => 'smtp',

    // true にすると 入力→確認画面→送信 のフローになる（確認画面は submit.php が描画）。
    // 確認画面ありのときは Ajax 送信は使えない（form の data-ajax を外す）。
    'confirm' => false,

    // SMTP 認証情報（Xserver ならサーバーパネル > メールアカウント設定に記載）
    'smtp' => [
        'host'       => 'sv0000.xserver.jp',
        'port'       => 587,
        'username'   => 'noreply@example.com',
        'password'   => '',
        'encryption' => 'tls', // 587 なら 'tls' / 465 なら 'ssl'
    ],

    // フォーム項目定義。HTML 側の name 属性と一致させる。
    // type: text | email | tel | textarea | select | checkbox（checkbox は複数値を「、」で連結）
    'fields' => [
        'name'    => ['label' => 'お名前',           'type' => 'text',     'required' => true,  'max' => 100],
        'email'   => ['label' => 'メールアドレス',   'type' => 'email',    'required' => true,  'max' => 254],
        'message' => ['label' => 'お問い合わせ内容', 'type' => 'textarea', 'required' => true,  'max' => 5000],
    ],

    // 返信先・自動返信の宛先に使うフィールド名（fields のキー）
    'email_field' => 'email',

    // ハニーポットの name 属性（HTML 側と一致させる。人間には見えない入力欄）
    'honeypot' => 'company',

    // 送信完了後のリダイレクト先
    'redirect_thanks' => '/thanks.html',

    // 自動返信（送信者宛の受付完了メール）
    'auto_reply' => [
        'enabled' => true,
        'subject' => '【サンプルサイト】お問い合わせを受け付けました',
        // 本文冒頭。この後に「以下の内容で受け付けました」＋入力内容が続く
        'body_header' => "この度はお問い合わせいただき、誠にありがとうございます。\n以下の内容で受け付けました。担当者より折り返しご連絡いたします。",
        // 本文末尾の署名
        'signature' => "――――――――――――――――\nサンプルサイト\nhttps://example.com\n※このメールは自動送信です。",
    ],

    // reCAPTCHA v3。secret_key が空なら無効（ハニーポットのみで動く）。
    // site_key は HTML 側にも記載する（公開可）。secret_key はこのファイルのみ（コミット禁止）。
    'recaptcha' => [
        'site_key'   => '',
        'secret_key' => '',
        'threshold'  => 0.5,
    ],
];
