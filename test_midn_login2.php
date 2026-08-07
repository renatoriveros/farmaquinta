<?php
function getHeaders() {
    return [
        'User-Agent: Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7',
        'Accept-Language: es-ES,es;q=0.9',
        'Connection: keep-alive',
    ];
}

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "https://www.midn.cl/extcompany/account/login/");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch, CURLOPT_HEADER, 1);
curl_setopt($ch, CURLOPT_HTTPHEADER, getHeaders());
$response = curl_exec($ch);

preg_match_all('/^Set-Cookie:\s*([^;]*)/mi', $response, $matches);
$cookies = array();
foreach($matches[1] as $item) {
    parse_str($item, $cookie);
    $cookies = array_merge($cookies, $cookie);
}

preg_match('/name="form_key" type="hidden" value="([^"]+)"/', $response, $form_key_match);
$form_key = $form_key_match[1] ?? '';

$cookie_string = "";
foreach($cookies as $k => $v) {
    $cookie_string .= "$k=$v; ";
}

echo "Step 1: PHPSESSID=" . ($cookies['PHPSESSID']??'') . " form_key=" . $form_key . "\n";

// Now POST
$post_data = http_build_query([
    'form_key' => $form_key,
    'login[rut_company]' => '77440145-8',
    'login[username]' => 'farmaquintaspa@gmail.com',
    'login[password]' => 'Valpo.1621',
    'show-password' => 'on',
    'login[option]' => '2'
]);

$ch2 = curl_init();
curl_setopt($ch2, CURLOPT_URL, "https://www.midn.cl/extcompany/account/loginPost/");
curl_setopt($ch2, CURLOPT_RETURNTRANSFER, 1);
curl_setopt($ch2, CURLOPT_HEADER, 1);
curl_setopt($ch2, CURLOPT_POST, 1);
curl_setopt($ch2, CURLOPT_POSTFIELDS, $post_data);
$headers = getHeaders();
$headers[] = "Cookie: $cookie_string";
$headers[] = "Content-Type: application/x-www-form-urlencoded";
$headers[] = "Origin: https://www.midn.cl";
$headers[] = "Referer: https://www.midn.cl/extcompany/account/login/";
curl_setopt($ch2, CURLOPT_HTTPHEADER, $headers);
$response2 = curl_exec($ch2);
echo "Step 2: Login Response Headers:\n";
echo substr($response2, 0, strpos($response2, "\r\n\r\n"));
