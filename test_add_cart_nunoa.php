<?php
require __DIR__ . '/vendor/autoload.php';
$app = require_once __DIR__ . '/bootstrap/app.php';
$kernel = $app->make(Illuminate\Contracts\Console\Kernel::class);
$kernel->bootstrap();

$nunoaCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'midn')->where('activo', true)->first();
if (!$nunoaCreds) {
    die("No credentials found.\n");
}
$nunoaCookies = $nunoaCreds->cookies_sesion;

$formKey = '';
if (preg_match('/form_key=([^;]+)/', $nunoaCookies, $fkMatch)) {
    $formKey = $fkMatch[1];
}
echo "Form Key: $formKey\n";

// Usaremos un producto fijo de prueba. Asegúrate de poner un ID válido, por ejemplo:
$productId = '23374'; // Ibuprofeno o similar, ajusta si es necesario.
$cantidad = 1;
$uenc = base64_encode('https://www.midn.cl/');
$url = 'https://www.midn.cl/checkout/cart/add/uenc/' . $uenc . '/product/' . $productId . '/';

$postData = "------WebKitFormBoundaryPA3UF7wh9ahTGiCz\r\n" .
            "Content-Disposition: form-data; name=\"product\"\r\n\r\n" .
            $productId . "\r\n" .
            "------WebKitFormBoundaryPA3UF7wh9ahTGiCz\r\n" .
            "Content-Disposition: form-data; name=\"uenc\"\r\n\r\n" .
            $uenc . "\r\n" .
            "------WebKitFormBoundaryPA3UF7wh9ahTGiCz\r\n" .
            "Content-Disposition: form-data; name=\"form_key\"\r\n\r\n" .
            $formKey . "\r\n" .
            "------WebKitFormBoundaryPA3UF7wh9ahTGiCz\r\n" .
            "Content-Disposition: form-data; name=\"qty\"\r\n\r\n" .
            $cantidad . "\r\n" .
            "------WebKitFormBoundaryPA3UF7wh9ahTGiCz--\r\n";

$cmd = "curl -i -s -k -4 --http1.1 -X POST -m 10 " . escapeshellarg($url) .
       " -H 'accept: application/json, text/javascript, */*; q=0.01'" .
       " -H 'content-type: multipart/form-data; boundary=----WebKitFormBoundaryPA3UF7wh9ahTGiCz'" .
       " -H 'x-requested-with: XMLHttpRequest'" .
       " -H 'origin: https://www.midn.cl'" .
       " -H 'sec-ch-ua: \"Not;A=Brand\";v=\"8\", \"Chromium\";v=\"150\", \"Google Chrome\";v=\"150\"'" .
       " -H 'sec-ch-ua-mobile: ?0'" .
       " -H 'sec-ch-ua-platform: \"Windows\"'" .
       " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'" .
       " -b " . escapeshellarg($nunoaCookies) .
       " --data-raw " . escapeshellarg($postData);

echo "Running command...\n";
$response = shell_exec($cmd);
echo "Response:\n";
echo substr($response, 0, 1000);
