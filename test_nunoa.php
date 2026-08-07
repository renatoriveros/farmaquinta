<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$nunoaCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'midn')->first();
$nunoaCookies = $nunoaCreds->cookies_sesion;

$urlNunoa = 'https://www.midn.cl/catalogsearch/result/?q=ibuprofeno';

$cmdNunoa = "curl -s -k -4 --http1.1 -m 10 " . escapeshellarg($urlNunoa) .
    " -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7'" .
    " -H 'accept-language: es-ES,es;q=0.9'" .
    " -H 'sec-ch-ua: \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Google Chrome\";v=\"150\"'" .
    " -H 'sec-ch-ua-mobile: ?0'" .
    " -H 'sec-ch-ua-platform: \"Windows\"'" .
    " -H 'sec-fetch-dest: document'" .
    " -H 'sec-fetch-mode: navigate'" .
    " -H 'sec-fetch-site: same-origin'" .
    " -H 'upgrade-insecure-requests: 1'" .
    " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'" .
    " -b " . escapeshellarg($nunoaCookies);

$responseNunoa = shell_exec($cmdNunoa);
file_put_contents('nunoa_raw.html', $responseNunoa);
echo "Done";
