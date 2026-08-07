<?php
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.midn.cl/extcompany/account/login/");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HEADER, 1);
$response = curl_exec($ch);

preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $response, $matches);
$cookies = array();
foreach($matches[1] as $item) {
    parse_str($item, $cookie);
    $cookies = array_merge($cookies, $cookie);
}

// Extract form_key from HTML
preg_match('/name="form_key" type="hidden" value="([^"]+)"/', $response, $form_key_match);
$form_key = $form_key_match[1] ?? '';

echo "PHPSESSID: " . ($cookies['PHPSESSID'] ?? 'NONE') . "\n";
echo "FORM_KEY: " . $form_key . "\n";

$cookie_string = "";
foreach($cookies as $k => $v) {
    $cookie_string .= "$k=$v; ";
}

// Now POST
$post_data = http_build_query([
    'form_key' => $form_key,
    'login[rut_company]' => '77440145-8',
    'login[username]' => 'farmaquintaspa@gmail.com',
    'login[password]' => 'Valpo.1621',
    'show-password' => 'on',
    'login[option]' => '2',
    'g-recaptcha-response' => '',
    'captcha_version' => 'v3'
]);

$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, "https://www.midn.cl/extcompany/account/loginPost/");
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch2, CURLOPT_HEADER, 1);
curl_setopt($ch2, CURLOPT_POST, 1);
curl_setopt($ch2, CURLOPT_POSTFIELDS, $post_data);
curl_setopt($ch2, CURLOPT_HTTPHEADER, [
    "Cookie: $cookie_string"
]);
$response2 = curl_exec($ch2);
echo "RESPONSE HEADERS:\n";
echo substr($response2, 0, strpos($response2, "\r\n\r\n"));

