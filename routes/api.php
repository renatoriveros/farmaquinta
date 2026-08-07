<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\IngresoMercaderiaController;
use App\Http\Controllers\CatalogoController;

Route::post('/login', [AuthController::class, 'login']);
// Ruta para previsualizar el XML sin guardarlo aún en la base de datos
Route::post('/ingresos/previsualizar-xml', [IngresoMercaderiaController::class, 'previsualizar']);
Route::post('/catalogos/importar', [CatalogoController::class, 'importarExcel']);


Route::get('/test-toledo', function(\Illuminate\Http\Request $request) {
    $toledoCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'toledo')->first();
    $toledoCookies = $toledoCreds->cookies_sesion;
    
    // Obtener token
    $cmdHomeToledo = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/'" .
                     " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies);
    $homeToledoHtml = shell_exec($cmdHomeToledo);
    preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeToledoHtml, $tokenMatch);
    $tokenToledo = $tokenMatch[1] ?? '';

    $codigoProducto = $request->input('codigo', '100095'); // Por defecto un codigo valido
    $cantidad = $request->input('cantidad', 1);

    $url = 'https://drogueriatoledo.cl/eco_addProducto';
    $postData = http_build_query([
        '_token' => $tokenToledo,
        'codigo' => $codigoProducto,
        'cantidad' => $cantidad
    ]);

    $cmd = "curl -i -s -k -4 --http1.1 -X POST -m 10 " . escapeshellarg($url) .
           " -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8'" .
           " -H 'x-requested-with: XMLHttpRequest'" .
           " -H 'origin: https://drogueriatoledo.cl'" .
           " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'" .
           " -b " . escapeshellarg($toledoCookies) .
           " --data-raw " . escapeshellarg($postData);

    $response = shell_exec($cmd);
    
    return response()->json([
        'token' => $tokenToledo,
        'codigo_enviado' => $codigoProducto,
        'cantidad_enviada' => $cantidad,
        'response' => $response,
        'cookies_usadas' => $toledoCookies
    ]);
});
