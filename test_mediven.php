<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$medivenCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'mediven')->first();
$url = 'https://b2b.mediven.cl:8890/api/Orders/GetOrderInventory?' . http_build_query([
    'ID_Sucursal' => $medivenCreds->token_api ?? '2554',
    'ID_Proveedor' => '-1',
    'Solo_Ofertas' => '0',
    'isMobile' => 'true',
    'Searching' => 'paracetamol'
]);

$cmd = "curl -s -k -4 --http1.1 -m 10 " . escapeshellarg($url) . 
       " -H 'accept: application/json, text/plain, */*'" .
       " -H 'accept-language: es-ES,es;q=0.9'" .
       " -H 'origin: https://b2b.mediven.cl'" .
       " -H 'referer: https://b2b.mediven.cl/'" .
       " -H 'sec-ch-ua: \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Google Chrome\";v=\"150\"'" .
       " -H 'sec-ch-ua-mobile: ?1'" .
       " -H 'sec-ch-ua-platform: \"Android\"'" .
       " -H 'sec-fetch-dest: empty'" .
       " -H 'sec-fetch-mode: cors'" .
       " -H 'sec-fetch-site: same-site'" .
       " -H 'user-agent: Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/150.0.0.0 Mobile Safari/537.36'";

$response = shell_exec($cmd);
file_put_contents('mediven_raw.json', $response);
echo "Done";
