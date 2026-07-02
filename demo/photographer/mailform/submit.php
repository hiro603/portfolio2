<?php

use PHPMailer\PHPMailer\PHPMailer;

mb_internal_encoding('UTF-8');

require __DIR__ . '/vendor/phpmailer/Exception.php';
require __DIR__ . '/vendor/phpmailer/PHPMailer.php';
require __DIR__ . '/vendor/phpmailer/SMTP.php';

function h(string $s): string
{
    return htmlspecialchars($s, ENT_QUOTES, 'UTF-8');
}

function is_ajax(): bool
{
    return ($_SERVER['HTTP_X_REQUESTED_WITH'] ?? '') === 'XMLHttpRequest';
}

function error_page_html(string $title, array $messages): string
{
    $items = '';
    foreach ($messages as $message) {
        $items .= '<li>' . h($message) . '</li>';
    }
    $t = h($title);
    return <<<HTML
<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>{$t}</title>
<style>
body{font-family:"Hiragino Sans","Noto Sans JP",sans-serif;line-height:1.8;margin:0;background:#fafafa;color:#1a1a1a}
main{max-width:560px;margin:10vh auto;padding:0 24px}
h1{font-size:1.25rem}
ul{padding-left:1.2em}
button{font:inherit;padding:.6em 2em;cursor:pointer;border:1px solid #1a1a1a;background:#fff;border-radius:4px}
</style>
</head>
<body>
<main>
<h1>{$t}</h1>
<ul>{$items}</ul>
<button type="button" onclick="history.back()">入力画面に戻る</button>
</main>
</body>
</html>
HTML;
}

function respond_error(int $status, array $messages, string $title = '入力内容をご確認ください'): void
{
    http_response_code($status);
    if (is_ajax()) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode(['ok' => false, 'errors' => $messages], JSON_UNESCAPED_UNICODE);
    } else {
        header('Content-Type: text/html; charset=UTF-8');
        echo error_page_html($title, $messages);
    }
    exit;
}

function respond_success(array $config): void
{
    if (is_ajax()) {
        header('Content-Type: application/json; charset=UTF-8');
        echo json_encode([
            'ok'       => true,
            'redirect' => $config['redirect_thanks'],
            'message'  => '送信しました。ありがとうございます。',
        ], JSON_UNESCAPED_UNICODE);
    } else {
        header('Location: ' . $config['redirect_thanks'], true, 303);
    }
    exit;
}

function validate_fields(array $config): array
{
    $values = [];
    $errors = [];
    foreach ($config['fields'] as $name => $field) {
        $raw = $_POST[$name] ?? '';
        if (is_array($raw)) {
            $raw = implode('、', array_map('strval', $raw));
        }
        $value = str_replace(["\r\n", "\r"], "\n", (string)$raw);
        $type = $field['type'] ?? 'text';
        if ($type !== 'textarea') {
            $value = str_replace("\n", ' ', $value); // 単一行項目の改行除去（メールヘッダインジェクション対策）
        }
        $value = trim($value);
        $label = $field['label'] ?? $name;

        if ($value === '') {
            if (!empty($field['required'])) {
                $errors[] = "{$label}を入力してください。";
            }
        } else {
            if ($type === 'email' && !filter_var($value, FILTER_VALIDATE_EMAIL)) {
                $errors[] = "{$label}の形式が正しくありません。";
            }
            if ($type === 'tel') {
                $value = mb_convert_kana($value, 'as');
                if (!preg_match('/\A[0-9+\-() ]{8,20}\z/', $value)) {
                    $errors[] = "{$label}の形式が正しくありません。";
                }
            }
            if (isset($field['max']) && mb_strlen($value) > $field['max']) {
                $errors[] = "{$label}は{$field['max']}文字以内で入力してください。";
            }
        }
        $values[$name] = $value;
    }
    return [$values, $errors];
}

function verify_recaptcha(array $config): bool
{
    $secret = $config['recaptcha']['secret_key'] ?? '';
    if ($secret === '') {
        return true;
    }
    $token = (string)($_POST['g-recaptcha-response'] ?? '');
    if ($token === '') {
        return false;
    }
    $context = stream_context_create(['http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/x-www-form-urlencoded\r\n",
        'content' => http_build_query([
            'secret'   => $secret,
            'response' => $token,
            'remoteip' => $_SERVER['REMOTE_ADDR'] ?? '',
        ]),
        'timeout' => 10,
    ]]);
    $response = @file_get_contents('https://www.google.com/recaptcha/api/siteverify', false, $context);
    $result = $response !== false ? json_decode($response, true) : null;
    if (!is_array($result) || empty($result['success'])) {
        return false;
    }
    $threshold = $config['recaptcha']['threshold'] ?? 0.5;
    return !isset($result['score']) || $result['score'] >= $threshold;
}

function format_values(array $config, array $values): array
{
    $lines = [];
    foreach ($config['fields'] as $name => $field) {
        $lines[] = '【' . ($field['label'] ?? $name) . '】';
        $lines[] = ($values[$name] ?? '') === '' ? '（未入力）' : $values[$name];
        $lines[] = '';
    }
    return $lines;
}

function build_body(array $config, array $values): string
{
    $lines = array_merge(
        [$config['site_name'] . ' のフォームから送信がありました。', ''],
        format_values($config, $values),
        [
            '----',
            '送信日時: ' . date('Y-m-d H:i:s'),
            'IPアドレス: ' . ($_SERVER['REMOTE_ADDR'] ?? '不明'),
        ]
    );
    return implode("\n", $lines);
}

function build_auto_reply_body(array $config, array $values): string
{
    $autoReply = $config['auto_reply'];
    $lines = array_merge(
        [$autoReply['body_header'], ''],
        format_values($config, $values),
        [$autoReply['signature']]
    );
    return implode("\n", $lines);
}

function deliver(array $config, string $to, string $subject, string $body, string $replyTo = ''): void
{
    $transport = $config['transport'] ?? 'smtp';

    if ($transport === 'file') {
        $dir = __DIR__ . '/outbox';
        if (!is_dir($dir)) {
            mkdir($dir, 0755, true);
        }
        $content = "To: {$to}\nSubject: {$subject}\nReply-To: {$replyTo}\n\n{$body}\n";
        file_put_contents($dir . '/' . date('Ymd-His') . '-' . bin2hex(random_bytes(4)) . '.txt', $content);
        return;
    }

    if ($transport === 'mail') {
        mb_language('uni');
        $from = $config['from'];
        $headers = 'From: ' . mb_encode_mimeheader($from['name'], 'UTF-8') . ' <' . $from['address'] . '>';
        if ($replyTo !== '') {
            $headers .= "\r\nReply-To: " . $replyTo;
        }
        // -f で envelope sender を From に揃える（レンタルサーバーでの迷惑メール判定対策）
        if (!mb_send_mail($to, $subject, $body, $headers, '-f' . $from['address'])) {
            throw new RuntimeException('mb_send_mail failed');
        }
        return;
    }

    $mail = new PHPMailer(true);
    $mail->CharSet = 'UTF-8';
    $mail->Encoding = 'base64';
    $mail->isSMTP();
    $smtp = $config['smtp'];
    $mail->Host = $smtp['host'];
    $mail->Port = (int)$smtp['port'];
    $mail->SMTPAuth = true;
    $mail->Username = $smtp['username'];
    $mail->Password = $smtp['password'];
    $mail->SMTPSecure = ($smtp['encryption'] ?? 'tls') === 'ssl'
        ? PHPMailer::ENCRYPTION_SMTPS
        : PHPMailer::ENCRYPTION_STARTTLS;
    $mail->Timeout = 15;
    $mail->setFrom($config['from']['address'], $config['from']['name']);
    $mail->addAddress($to);
    if ($replyTo !== '') {
        $mail->addReplyTo($replyTo);
    }
    $mail->Subject = $subject;
    $mail->Body = $body;
    $mail->isHTML(false);
    $mail->send();
}

function confirm_page_html(array $config, array $values, string $token): string
{
    $rows = '';
    foreach ($config['fields'] as $name => $field) {
        $label = h($field['label'] ?? $name);
        $value = ($values[$name] ?? '') === '' ? '（未入力）' : $values[$name];
        $valueHtml = nl2br(h($value));
        $rows .= "<div class=\"row\"><dt>{$label}</dt><dd>{$valueHtml}</dd></div>\n";
    }
    $t = h($token);
    $site = h($config['site_name']);
    return <<<HTML
<!doctype html>
<html lang="ja">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex">
<title>入力内容の確認 | {$site}</title>
<style>
body{font-family:"Hiragino Sans","Noto Sans JP",sans-serif;line-height:1.8;margin:0;background:#fafafa;color:#1a1a1a}
main{max-width:640px;margin:8vh auto;padding:0 24px}
h1{font-size:1.25rem}
dl{margin:2rem 0;border-top:1px solid #ddd}
.row{display:grid;grid-template-columns:9em 1fr;gap:8px;padding:12px 0;border-bottom:1px solid #ddd}
dt{font-weight:700}
dd{margin:0;overflow-wrap:anywhere}
.actions{display:flex;gap:12px;margin-top:2rem}
button{font:inherit;padding:.7em 2em;cursor:pointer;border:1px solid #1a1a1a;border-radius:4px;background:#fff}
button[type="submit"]{background:#1a1a1a;color:#fff}
@media (max-width:600px){.row{grid-template-columns:1fr}}
</style>
</head>
<body>
<main>
<h1>入力内容の確認</h1>
<p>以下の内容で送信します。よろしければ「送信する」を押してください。</p>
<dl>
{$rows}</dl>
<form method="post">
<input type="hidden" name="_step" value="send">
<input type="hidden" name="_token" value="{$t}">
<div class="actions">
<button type="button" onclick="history.back()">修正する</button>
<button type="submit">送信する</button>
</div>
</form>
</main>
</body>
</html>
HTML;
}

$configPath = __DIR__ . '/config.php';
if (!is_file($configPath)) {
    http_response_code(500);
    exit('config.php がありません。config.sample.php をコピーして作成してください。');
}
$config = require $configPath;

if (($_SERVER['REQUEST_METHOD'] ?? '') !== 'POST') {
    http_response_code(405);
    header('Allow: POST');
    exit('Method Not Allowed');
}

$allowedOrigins = $config['allowed_origins'] ?? [];
if ($allowedOrigins !== []) {
    $origin = $_SERVER['HTTP_ORIGIN'] ?? '';
    if ($origin === '' && isset($_SERVER['HTTP_REFERER'])) {
        $parts = parse_url($_SERVER['HTTP_REFERER']);
        if (is_array($parts) && isset($parts['scheme'], $parts['host'])) {
            $origin = $parts['scheme'] . '://' . $parts['host'] . (isset($parts['port']) ? ':' . $parts['port'] : '');
        }
    }
    if (!in_array($origin, $allowedOrigins, true)) {
        respond_error(403, ['不正なリクエストです。'], '送信できませんでした');
    }
}

$confirmEnabled = !empty($config['confirm']);
if ($confirmEnabled) {
    session_set_cookie_params(['httponly' => true, 'samesite' => 'Lax']);
    session_start();
}

if ($confirmEnabled && ($_POST['_step'] ?? '') === 'send') {
    $saved = $_SESSION['mailform'] ?? null;
    $token = (string)($_POST['_token'] ?? '');
    if (!is_array($saved) || $token === '' || !hash_equals($saved['token'], $token) || $saved['expires'] < time()) {
        respond_error(400, ['セッションの有効期限が切れました。お手数ですが最初から入力し直してください。'], '送信できませんでした');
    }
    unset($_SESSION['mailform']);
    $values = $saved['values'];
} else {
    if (trim((string)($_POST[$config['honeypot'] ?? 'company'] ?? '')) !== '') {
        respond_success($config); // botには成功を装い、何も送らない
    }
    [$values, $errors] = validate_fields($config);
    if ($errors !== []) {
        respond_error(400, $errors);
    }
    if (!verify_recaptcha($config)) {
        respond_error(400, ['スパム判定により送信できませんでした。時間をおいて再度お試しください。'], '送信できませんでした');
    }
    if ($confirmEnabled) {
        if (is_ajax()) {
            respond_error(400, ['確認画面モードでは Ajax 送信は使えません（フォームの data-ajax を外してください）。'], '設定エラー');
        }
        $token = bin2hex(random_bytes(16));
        $_SESSION['mailform'] = ['token' => $token, 'values' => $values, 'expires' => time() + 1800];
        header('Content-Type: text/html; charset=UTF-8');
        echo confirm_page_html($config, $values, $token);
        exit;
    }
}

$emailField = $config['email_field'] ?? 'email';
$replyTo = '';
if (isset($values[$emailField]) && filter_var($values[$emailField], FILTER_VALIDATE_EMAIL)) {
    $replyTo = $values[$emailField];
}

try {
    deliver($config, $config['to'], $config['subject'], build_body($config, $values), $replyTo);
} catch (Throwable $e) {
    error_log('mailform: ' . $e->getMessage());
    respond_error(500, ['送信処理でエラーが発生しました。お手数ですが時間をおいて再度お試しください。'], '送信できませんでした');
}

if (!empty($config['auto_reply']['enabled']) && $replyTo !== '') {
    try {
        deliver($config, $replyTo, $config['auto_reply']['subject'], build_auto_reply_body($config, $values));
    } catch (Throwable $e) {
        error_log('mailform auto-reply: ' . $e->getMessage()); // 管理者宛は送信済みのため利用者側はエラーにしない
    }
}

respond_success($config);
