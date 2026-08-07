<?php
require 'vendor/autoload.php';
$app = require_once 'bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$creds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'toledo')->first();
$cookies = $creds->cookies_sesion;

$cmdHome = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/' -H 'user-agent: Mozilla/5.0' -b '$cookies'";
$homeHtml = shell_exec($cmdHome);
preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeHtml, $m);
$token = $m[1] ?? '';

if ($token) {
    $postData = http_build_query(['_token' => $token, 'Codigo' => 'ALL', 'Order' => 1, 'OrderCant' => 12, 'Type' => 'Desc', 'Texto' => 'EUTIROX']);
    $cmd = "curl -s -k -4 --http1.1 -X POST -m 10 'https://drogueriatoledo.cl/eco_getProductosActivos' -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' -H 'x-requested-with: XMLHttpRequest' -H 'origin: https://drogueriatoledo.cl' -H 'user-agent: Mozilla/5.0' -b '$cookies' --data-raw '$postData'";
    $resp = shell_exec($cmd);
    echo substr($resp, 0, 3000);
}
