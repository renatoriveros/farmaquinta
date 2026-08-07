<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Inertia\Inertia;

class CotizadorController extends Controller
{
    public function index()
    {
        $proveedores = [
            ['id' => 'nunoa', 'nombre' => 'Ñuñoa', 'color' => 'lime', 'activo' => true],
            ['id' => 'mediven', 'nombre' => 'Mediven (b2b nuevo)', 'color' => 'sky', 'activo' => true],
            ['id' => 'toledo', 'nombre' => 'Toledo', 'color' => 'orange', 'activo' => true],
        ];

        return Inertia::render('Cotizador/Index', [
            'proveedores' => $proveedores
        ]);
    }

    public function buscar(Request $request)
    {
        // Aumentar el límite de tiempo ya que Puppeteer puede tardar más de 30 segundos
        // si necesita loguearse en múltiples proveedores a la vez.
        set_time_limit(120);
        
        $query = $request->input('q', '');
        
        if (!$query || strlen($query) < 3) {
            return response()->json([]);
        }

        $resultados = [];

        // 1. SCRAPING MEDIVEN (API Abierta)
        try {
            $medivenCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'mediven')->where('activo', true)->first();
            $idSucursal = $medivenCreds ? $medivenCreds->token_api : '2554';

            $url = 'https://b2b.mediven.cl:8890/api/Orders/GetOrderInventory?' . http_build_query([
                'ID_Sucursal' => $idSucursal, // ID Sucursal dinámico desde la BD cifrada
                'ID_Proveedor' => '-1',
                'Solo_Ofertas' => '0',
                'isMobile' => 'true',
                'Searching' => $query
            ]);

            // Usamos shell_exec con curl HTTP/1.1 para evitar bloqueos del WAF
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

            $medivenData = json_decode($response, true);
            
            if (!$medivenData) {
                return response()->json(['error' => 'CURL ERROR', 'details' => 'Timeout o bloqueo de WAF']);
            }

            if (is_array($medivenData)) {
                // Mapear los resultados de Mediven al formato unificado
                foreach (array_slice($medivenData, 0, 15) as $item) { 
                    $resultados[] = [
                        'id_proveedor' => 'mediven',
                        'id_producto_proveedor' => $item['ID_Producto'],
                        'nombre' => $item['Descripcion'],
                        'codigo_barras' => $item['Barcode'] ?? '',
                        'laboratorio' => $item['Laboratorio'] ?? '',
                        'precio' => (float)$item['Precio_Final'],
                        'stock' => 'Disponible',
                        'color' => 'sky',
                        'vencimiento' => $item['Fecha_Vencimiento_Format'] ?? ''
                    ];
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error Scraping Mediven Exception: ' . $e->getMessage());
        }

        // 2. SCRAPING DROGUERÍA ÑUÑOA (MIDN)
        try {
            $nunoaCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'midn')->where('activo', true)->first();
            $nunoaCookies = $nunoaCreds ? $nunoaCreds->cookies_sesion : '';

            // Función auxiliar para buscar en MIDN con cookies dadas
            $buscarEnNunoa = function($cookies, $query) {
                if (!$cookies) return ['exito' => false, 'resultados' => [], 'precios_cero' => false];
                
                $urlNunoa = 'https://www.midn.cl/catalogsearch/result/?q=' . urlencode($query);

                $cmdNunoa = "curl -s -k -4 --http1.1 -m 15 " . escapeshellarg($urlNunoa) .
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
                            " -b " . escapeshellarg($cookies);

                $responseNunoa = shell_exec($cmdNunoa);

                if (!$responseNunoa || strlen($responseNunoa) < 1000) {
                    return ['exito' => false, 'resultados' => [], 'precios_cero' => false];
                }

                // Verificar si redirige al login (sesión expirada)
                if (strpos($responseNunoa, 'extcompany/account/login') !== false && 
                    strpos($responseNunoa, 'data-product-id') === false) {
                    return ['exito' => false, 'resultados' => [], 'precios_cero' => false, 'sesion_expirada' => true];
                }

                // Extraer vencimientos por product-id
                $vencimientosNunoa = [];
                if (preg_match_all('/data-product-id="(\d+)"(?:(?!data-product-id).)*?<span class="product-expiration-date">Vencimiento:\s*([^<]+)<\/span>/s', $responseNunoa, $matchesV, PREG_SET_ORDER)) {
                    foreach ($matchesV as $m) {
                        $vencimientosNunoa[$m[1]] = trim($m[2]);
                    }
                }

                // Extraer SKU por product-id desde el HTML (data-product-sku está en el form)
                $skusPorId = [];
                if (preg_match_all('/data-product-sku="([^"]+)"[^>]*action="[^"]*\/product\/(\d+)\//s', $responseNunoa, $matchesSku, PREG_SET_ORDER)) {
                    foreach ($matchesSku as $m) {
                        $skusPorId[$m[2]] = $m[1];
                    }
                }

                // Extraer el JSON de Magento (Amasty GA4 analytics con datos de productos)
                $tempResultados = [];
                $hayPreciosCero = false;
                if (preg_match_all('/<script type="text\/x-magento-init">(.*?)<\/script>/s', $responseNunoa, $matches)) {
                    foreach ($matches[1] as $jsonStr) {
                        $data = json_decode($jsonStr, true);
                        if (isset($data['*']['Amasty_GA4/js/event/product/select-item']['productEventData']['search_results'])) {
                            $searchResults = $data['*']['Amasty_GA4/js/event/product/select-item']['productEventData']['search_results'];
                            
                            foreach ($searchResults as $productId => $item) {
                                if (isset($item['ecommerce']['items'][0])) {
                                    $prod = $item['ecommerce']['items'][0];
                                    $precio = (float)$prod['price'];
                                    if ($precio == 0) {
                                        $hayPreciosCero = true;
                                        break;
                                    }
                                    
                                    $tempResultados[] = [
                                        'id_proveedor' => 'nunoa',
                                        'id_producto_proveedor' => $productId,
                                        'sku_proveedor' => $skusPorId[$productId] ?? ($prod['item_id'] ?? ''),
                                        'nombre' => $prod['item_name'],
                                        'codigo_barras' => '',
                                        'laboratorio' => $prod['item_brand'] ?? '',
                                        'precio' => $precio,
                                        'stock' => 'Disponible',
                                        'color' => 'lime',
                                        'vencimiento' => $vencimientosNunoa[$productId] ?? ''
                                    ];
                                }
                            }
                            break;
                        }
                    }
                }
                
                if (!$hayPreciosCero && count($tempResultados) > 0) {
                    return ['exito' => true, 'resultados' => $tempResultados, 'precios_cero' => false];
                }
                
                return ['exito' => false, 'resultados' => $tempResultados, 'precios_cero' => $hayPreciosCero];
            };

            // Primer intento con cookies almacenadas
            $resultadoNunoa = $buscarEnNunoa($nunoaCookies, $query);

            if ($resultadoNunoa['exito']) {
                $resultados = array_merge($resultados, $resultadoNunoa['resultados']);
            } else {
                // Sesión expirada o precios en 0: renovar automáticamente
                \Log::info('MIDN Ñuñoa: Sesión expirada o precios en 0, intentando renovar con midn_session.js...');
                $nunoaCookiesNuevas = $this->renovarSesionNunoa($nunoaCreds);
                
                if ($nunoaCookiesNuevas) {
                    \Log::info('MIDN Ñuñoa: Sesión renovada exitosamente, reintentando búsqueda...');
                    $resultadoNunoa = $buscarEnNunoa($nunoaCookiesNuevas, $query);
                    if ($resultadoNunoa['exito']) {
                        $resultados = array_merge($resultados, $resultadoNunoa['resultados']);
                    } else {
                        \Log::warning('MIDN Ñuñoa: Búsqueda falló incluso con cookies renovadas. Precios cero: ' . ($resultadoNunoa['precios_cero'] ? 'sí' : 'no'));
                    }
                } else {
                    \Log::warning('MIDN Ñuñoa: No se pudieron renovar las cookies de sesión.');
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error Scraping Ñuñoa Exception: ' . $e->getMessage());
        }


        // 3. DROGUERIA TOLEDO
        try {
            $toledoCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'toledo')->where('activo', true)->first();
            if ($toledoCreds && $toledoCreds->cookies_sesion) {
                $toledoCookies = $toledoCreds->cookies_sesion;
                $urlToledo = 'https://drogueriatoledo.cl/eco_getProductosActivos';
                
                $tokenToledo = '';
                $cmdHomeToledo = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/'" .
                                 " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies);
                $homeToledoHtml = shell_exec($cmdHomeToledo);
                if (preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeToledoHtml, $tokenMatch)) {
                    $tokenToledo = $tokenMatch[1];
                }

                // Si no encontramos token, probablemente la sesión expiró.
                if (!$tokenToledo) {
                    $toledoCookies = $this->renovarSesionToledo($toledoCreds);
                    if ($toledoCookies) {
                        $cmdHomeToledo = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/'" .
                                         " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies);
                        $homeToledoHtml = shell_exec($cmdHomeToledo);
                        if (preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeToledoHtml, $tokenMatch)) {
                            $tokenToledo = $tokenMatch[1];
                        }
                    }
                }

                if ($tokenToledo) {
                    $postData = http_build_query([
                        '_token' => $tokenToledo,
                        'Codigo' => 'ALL',
                        'Order' => 1,
                        'OrderCant' => 12,
                        'Type' => 'Desc',
                        'Texto' => $query
                    ]);

                    $cmdToledo = "curl -s -k -4 --http1.1 -X POST -m 10 " . escapeshellarg($urlToledo) .
                        " -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8'" .
                        " -H 'x-requested-with: XMLHttpRequest'" .
                        " -H 'origin: https://drogueriatoledo.cl'" .
                        " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'" .
                        " -b " . escapeshellarg($toledoCookies) .
                        " --data-raw " . escapeshellarg($postData);

                    $responseToledo = shell_exec($cmdToledo);
                                \Log::info('RENOVADO TOLEDO RESPONSE: ' . substr($responseToledo, 0, 500));

                    if ($responseToledo && strpos($responseToledo, 'DivAgregar') !== false) {
                        preg_match_all('/<div class="d-inline-block DivProductBlock">.*?CargarModalProducto\(\'(\d+)\'\).*?<div class="row"[^>]*id="DivAgregar_\d+_1".*?<strong>\$([0-9.]+)<\/strong>.*?<span class="TextDescProd"><strong>(.*?)<\/strong>(?:.*?VENCIMIENTO:\s*([^<]+))?/s', $responseToledo, $matches, PREG_SET_ORDER);
                        
                        foreach ($matches as $match) {
                            $idProducto = $match[1];
                            $precioStr = str_replace('.', '', $match[2]);
                            $precio = (float)$precioStr;
                            $nombreCompleto = trim(strip_tags($match[3]));
                            $laboratorio = '';
                            $vencimiento = isset($match[4]) ? trim($match[4]) : '';
                            
                            if (preg_match('/(.*?)\s*\((.*?)\)$/', $nombreCompleto, $labMatch)) {
                                $nombreCompleto = trim($labMatch[1]);
                                $laboratorio = trim($labMatch[2]);
                            }
                            
                            $resultados[] = [
                                'id_proveedor' => 'toledo',
                                'id_producto_proveedor' => $idProducto,
                                'nombre' => $nombreCompleto,
                                'codigo_barras' => '',
                                'laboratorio' => $laboratorio,
                                'precio' => $precio,
                                'stock' => 'Disponible',
                                'color' => 'orange',
                                'vencimiento' => $vencimiento
                            ];
                        }
                    } elseif ($responseToledo === null || $responseToledo === '' || (strpos($responseToledo, 'NO HAY PRODUCTOS') === false)) {
                        // Posible sesión expirada, renovar e intentar de nuevo
                        $toledoCookies = $this->renovarSesionToledo($toledoCreds);
                        if ($toledoCookies) {
                            $cmdHomeToledo = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/'" .
                                             " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies);
                            $homeToledoHtml = shell_exec($cmdHomeToledo);
                            if (preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeToledoHtml, $tokenMatch)) {
                                $tokenToledo = $tokenMatch[1];
                            }
                            if ($tokenToledo) {
                                $postData = http_build_query(['_token' => $tokenToledo, 'Codigo' => 'ALL', 'Order' => 1, 'OrderCant' => 12, 'Type' => 'Desc', 'Texto' => $query]);
                                $cmdToledo = "curl -s -k -4 --http1.1 -X POST -m 10 " . escapeshellarg($urlToledo) .
                                    " -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' -H 'x-requested-with: XMLHttpRequest' -H 'origin: https://drogueriatoledo.cl' -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies) . " --data-raw " . escapeshellarg($postData);
                                $responseToledo = shell_exec($cmdToledo);
                                \Log::info('RENOVADO TOLEDO RESPONSE: ' . substr($responseToledo, 0, 500));
                                if ($responseToledo && strpos($responseToledo, 'DivAgregar') !== false) {
                                    preg_match_all('/<div class="d-inline-block DivProductBlock">.*?CargarModalProducto\(\'(\d+)\'\).*?<div class="row"[^>]*id="DivAgregar_\d+_1".*?<strong>\$([0-9.]+)<\/strong>.*?<span class="TextDescProd"><strong>(.*?)<\/strong>(?:.*?VENCIMIENTO:\s*([^<]+))?/s', $responseToledo, $matches, PREG_SET_ORDER);
                                    foreach ($matches as $match) {
                                        $idProducto = $match[1];
                                        $precioStr = str_replace('.', '', $match[2]);
                                        $precio = (float)$precioStr;
                                        $nombreCompleto = trim(strip_tags($match[3]));
                                        $laboratorio = '';
                                        $vencimiento = isset($match[4]) ? trim($match[4]) : '';
                                        if (preg_match('/(.*?)\s*\((.*?)\)$/', $nombreCompleto, $labMatch)) {
                                            $nombreCompleto = trim($labMatch[1]);
                                            $laboratorio = trim($labMatch[2]);
                                        }
                                        $resultados[] = ['id_proveedor' => 'toledo', 'id_producto_proveedor' => $idProducto, 'nombre' => $nombreCompleto, 'codigo_barras' => '', 'laboratorio' => $laboratorio, 'precio' => $precio, 'stock' => 'Disponible', 'color' => 'orange', 'vencimiento' => $vencimiento];
                                    }
                                }
                            }
                        }
                    }
                }
            }
        } catch (\Exception $e) {
            \Log::error('Error Scraping Toledo Exception: ' . $e->getMessage());
        }

        // Agrupamos los resultados por nombre/código de barras para la tabla comparativa
        $productosAgrupados = [];

        foreach ($resultados as $item) {
            // Usamos el código de barras como llave principal si existe, sino el nombre
            $llave = !empty($item['codigo_barras']) ? $item['codigo_barras'] : $item['nombre'];
            
            if (!isset($productosAgrupados[$llave])) {
                $productosAgrupados[$llave] = [
                    'nombre' => $item['nombre'],
                    'codigo_barras' => $item['codigo_barras'],
                    'laboratorio' => $item['laboratorio'],
                    'opciones' => []
                ];
            }

            $productosAgrupados[$llave]['opciones'][] = [
                'proveedor' => $item['id_proveedor'],
                'id_producto_proveedor' => $item['id_producto_proveedor'],
                'precio' => $item['precio'],
                'stock' => $item['stock'],
                'color' => $item['color'],
                'vencimiento' => $item['vencimiento'] ?? ''
            ];
        }

        return response()->json(array_values($productosAgrupados));
    }

    public function enviarCarrito(\Illuminate\Http\Request $request)
    {
        $carrito = $request->input('carrito', []);
        
        if (empty($carrito)) {
            return response()->json(['success' => false, 'message' => 'Carrito vacío']);
        }

        // Agrupar items por proveedor
        $itemsMediven = [];
        $itemsNunoa = [];
        $itemsToledo = [];

        foreach ($carrito as $item) {
            if ($item['proveedor'] === 'mediven') {
                $itemsMediven[] = $item;
            } elseif ($item['proveedor'] === 'nunoa') {
                $itemsNunoa[] = $item;
            } elseif ($item['proveedor'] === 'toledo') {
                $itemsToledo[] = $item;
            }
        }

        $resultados = [];
        $erroresMediven = 0;
        $erroresNunoa = 0;
        $erroresToledo = 0;

        // ENVIAR A MEDIVEN
        if (!empty($itemsMediven)) {
            try {
                $medivenCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'mediven')->where('activo', true)->first();
                $idSucursal = $medivenCreds ? $medivenCreds->token_api : '2554';
                $idUsuario = $medivenCreds ? $medivenCreds->usuario : '15';

                foreach ($itemsMediven as $item) {
                    $url = 'https://b2b.mediven.cl:8890/api/ModifyOC/AddOC?' . http_build_query([
                        'ID_Sucursal' => $idSucursal,
                        'ID_Usuario' => $idUsuario,
                        'ID_Vendedor' => '-1',
                        'ID_Producto' => $item['id_producto_proveedor'],
                        'Cantidad' => $item['cantidad']
                    ]);

                    $cmd = "curl -s -k -4 --http1.1 -m 5 " . escapeshellarg($url) . 
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

                    $res = shell_exec($cmd);
                    if (!$res) $erroresMediven++;
                }
            } catch (\Exception $e) {
                \Log::error('Error enviando a Mediven: ' . $e->getMessage());
                $resultados['mediven'] = 'error_exception';
            }
        }

        // ENVIAR A DROGUERÍA ÑUÑOA
        if (!empty($itemsNunoa)) {
            try {
                $nunoaCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'midn')->where('activo', true)->first();
                $nunoaCookies = $nunoaCreds ? $nunoaCreds->cookies_sesion : '';
                
                // Función para enviar items al carrito de MIDN
                $enviarItemsNunoa = function($cookies, $items) {
                    $formKey = '';
                    if (preg_match('/form_key=([^;]+)/', $cookies, $fkMatch)) {
                        $formKey = $fkMatch[1];
                    }
                    
                    $errores = 0;
                    $exitos = 0;
                    foreach ($items as $item) {
                        $uenc = base64_encode('https://www.midn.cl/');
                        $url = 'https://www.midn.cl/checkout/cart/add/uenc/' . $uenc . '/product/' . $item['id_producto_proveedor'] . '/';

                        $cmd = "curl -s -k -4 --http1.1 -X POST -m 15 " . escapeshellarg($url) .
                               " -H 'accept: application/json, text/javascript, */*; q=0.01'" .
                               " -H 'x-requested-with: XMLHttpRequest'" .
                               " -H 'origin: https://www.midn.cl'" .
                               " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'" .
                               " -b " . escapeshellarg($cookies) .
                               " -F " . escapeshellarg("product=" . $item['id_producto_proveedor']) .
                               " -F " . escapeshellarg("uenc=" . $uenc) .
                               " -F " . escapeshellarg("form_key=" . $formKey) .
                               " -F " . escapeshellarg("qty=" . $item['cantidad']) .
                               " -w '\n%{http_code}'";

                        $response = shell_exec($cmd);
                        
                        // Separar body y HTTP code
                        $lines = explode("\n", trim($response ?? ''));
                        $httpCode = end($lines);
                        
                        if ($httpCode === '200') {
                            $exitos++;
                        } else {
                            $errores++;
                            \Log::warning("MIDN Ñuñoa cart: Error HTTP $httpCode al agregar producto " . $item['id_producto_proveedor']);
                        }
                    }
                    return ['exitos' => $exitos, 'errores' => $errores];
                };

                // Primer intento
                $resultado = $enviarItemsNunoa($nunoaCookies, $itemsNunoa);
                
                if ($resultado['errores'] > 0 && $resultado['exitos'] === 0) {
                    // Todas las peticiones fallaron → sesión expirada, renovar y reintentar
                    \Log::info('MIDN Ñuñoa carrito: Todos los items fallaron, renovando sesión...');
                    $nunoaCookiesNuevas = $this->renovarSesionNunoa($nunoaCreds);
                    
                    if ($nunoaCookiesNuevas) {
                        $resultado = $enviarItemsNunoa($nunoaCookiesNuevas, $itemsNunoa);
                        if ($resultado['errores'] > 0) {
                            $erroresNunoa += $resultado['errores'];
                        }
                    } else {
                        $erroresNunoa += count($itemsNunoa);
                        \Log::error('MIDN Ñuñoa carrito: No se pudo renovar la sesión.');
                    }
                } else {
                    $erroresNunoa += $resultado['errores'];
                }
            } catch (\Exception $e) {
                \Log::error('Error enviando a Ñuñoa: ' . $e->getMessage());
                $resultados['nunoa'] = "error_exception";
            }
        }

        // --- INYECCION TOLEDO ---
        $toledoCreds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', 'toledo')->where('activo', true)->first();
        if (!empty($itemsToledo) && $toledoCreds && $toledoCreds->cookies_sesion) {
            $toledoCookies = $toledoCreds->cookies_sesion;
            
            $tokenToledo = '';
            $cmdHomeToledo = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/'" .
                             " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies);
            $homeToledoHtml = shell_exec($cmdHomeToledo);
            if (preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeToledoHtml, $tokenMatch)) {
                $tokenToledo = $tokenMatch[1];
            }

            if (!$tokenToledo) {
                $toledoCookies = $this->renovarSesionToledo($toledoCreds);
                if ($toledoCookies) {
                    $cmdHomeToledo = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/' -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies);
                    $homeToledoHtml = shell_exec($cmdHomeToledo);
                    if (preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeToledoHtml, $tokenMatch)) {
                        $tokenToledo = $tokenMatch[1];
                    }
                }
            }

            if ($tokenToledo) {
                $url = 'https://drogueriatoledo.cl/eco_addProducto';
                foreach ($itemsToledo as $item) {
                    $renovar = false;
                    $postData = http_build_query([
                        '_token' => $tokenToledo,
                        'codigo' => $item['id_producto_proveedor'],
                        'cantidad' => $item['cantidad']
                    ]);

                    $cmd = "curl -s -k -4 --http1.1 -X POST -m 10 " . escapeshellarg($url) .
                           " -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8'" .
                           " -H 'x-requested-with: XMLHttpRequest'" .
                           " -H 'origin: https://drogueriatoledo.cl'" .
                           " -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'" .
                           " -b " . escapeshellarg($toledoCookies) .
                           " --data-raw " . escapeshellarg($postData);

                    $response = shell_exec($cmd);
                    $data = json_decode($response, true);
                    
                    if ($response === null || $response === '' || (is_array($data) && isset($data['message']) && strpos($data['message'], 'CSRF') !== false) || (empty($data) && !isset($data[0]['cantidad']) && !isset($data['error']))) {
                        $renovar = true;
                    }

                    if ($renovar) {
                        // Solo renovamos una vez por petición
                        $toledoCookies = $this->renovarSesionToledo($toledoCreds);
                        if ($toledoCookies) {
                            $cmdHomeToledo = "curl -s -k -4 --http1.1 -m 5 'https://drogueriatoledo.cl/b2b/' -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies);
                            $homeToledoHtml = shell_exec($cmdHomeToledo);
                            if (preg_match('/<input type="hidden" name="_token"\s+id="_token" value="([^"]+)">/', $homeToledoHtml, $tokenMatch)) {
                                $tokenToledo = $tokenMatch[1];
                            }
                            if ($tokenToledo) {
                                $postData = http_build_query(['_token' => $tokenToledo, 'codigo' => $item['id_producto_proveedor'], 'cantidad' => $item['cantidad']]);
                                $cmd = "curl -s -k -4 --http1.1 -X POST -m 10 " . escapeshellarg($url) . " -H 'content-type: application/x-www-form-urlencoded; charset=UTF-8' -H 'x-requested-with: XMLHttpRequest' -H 'origin: https://drogueriatoledo.cl' -H 'user-agent: Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' -b " . escapeshellarg($toledoCookies) . " --data-raw " . escapeshellarg($postData);
                                $response = shell_exec($cmd);
                                $data = json_decode($response, true);
                            }
                        }
                    }

                    if (empty($data) || (!isset($data[0]['cantidad']) && !isset($data['error']))) {
                        $erroresToledo++;
                    }
                }
            } else {
                $erroresToledo = count($itemsToledo);
            }
        }

        return response()->json([
            'success' => true,
            'resultados' => [
                'mediven' => count($itemsMediven) > 0 ? "Inyectados: " . count($itemsMediven) . ". Errores: $erroresMediven" : "Sin productos",
                'nunoa' => count($itemsNunoa) > 0 ? "Inyectados: " . count($itemsNunoa) . ". Errores: $erroresNunoa" : "Sin productos",
                'toledo' => count($itemsToledo) > 0 ? "Inyectados: " . count($itemsToledo) . ". Errores: $erroresToledo" : "Sin productos",
            ]
        ]);
    }

    public function actualizarCookieGet(Request $request)
    {
        $proveedor = $request->input('proveedor');
        $cookie = $request->input('cookie');

        if ($proveedor && $cookie) {
            $creds = \App\Models\ProveedorB2BCredencial::where('codigo_proveedor', $proveedor)->first();
            if ($creds) {
                $creds->cookies_sesion = $cookie;
                $creds->save();
            }
        }
        
        // Redirigir de vuelta al cotizador con mensaje de éxito (si estás usando Inertia, redirect()->route funciona bien)
        return redirect()->route('cotizador');
    }

    private function renovarSesionNunoa($credencialesModel)
    {
        if (!$credencialesModel || !$credencialesModel->usuario || !$credencialesModel->token_api) {
            return false;
        }

        $usuarioParts = explode('|', $credencialesModel->usuario);
        if (count($usuarioParts) < 2) return false;

        $rut = $usuarioParts[0];
        $email = $usuarioParts[1];
        $password = $credencialesModel->token_api;

        // Extraer la sucursal de las cookies almacenadas previamente
        $sucursal = '27086'; // Default
        if ($credencialesModel->cookies_sesion && preg_match('/extsucursal=[^;]*suc[^0-9]*(\d+)/', $credencialesModel->cookies_sesion, $sucMatch)) {
            $sucursal = $sucMatch[1];
        }

        // Usar midn_session.js (REST API, sin Puppeteer) en vez de midn_login.js
        $scriptPath = base_path('scrapers/midn_session.js');
        $cmd = "/Users/renatoriveros/.nvm/versions/node/v24.14.1/bin/node " . escapeshellarg($scriptPath) . " " . 
               escapeshellarg($rut) . " " . 
               escapeshellarg($email) . " " . 
               escapeshellarg($password) . " " .
               escapeshellarg($sucursal);

        $output = shell_exec($cmd);
        $data = json_decode($output, true);

        if ($data && isset($data['success']) && $data['success'] === true && !empty($data['cookies_sesion'])) {
            $credencialesModel->cookies_sesion = $data['cookies_sesion'];
            $credencialesModel->save();
            \Log::info('MIDN Ñuñoa: Cookies renovadas via REST API (sin Puppeteer). Sucursal: ' . $sucursal);
            return $data['cookies_sesion'];
        }

        \Log::warning('MIDN Ñuñoa: Fallo al renovar cookies. Output: ' . substr($output ?? '', 0, 200));
        return false;
    }

    private function renovarSesionToledo($credencialesModel)
    {
        if (!$credencialesModel || !$credencialesModel->usuario) {
            return false;
        }

        $usuarioParts = explode('|', $credencialesModel->usuario);
        if (count($usuarioParts) < 2) return false;

        $rut = $usuarioParts[0];
        $password = $usuarioParts[1];

        $scriptPath = base_path('scrapers/toledo_login.js');
        $cmd = "/Users/renatoriveros/.nvm/versions/node/v24.14.1/bin/node " . escapeshellarg($scriptPath) . " " . 
               escapeshellarg($rut) . " " . 
               escapeshellarg($password);

        $output = shell_exec($cmd);
        $data = json_decode($output, true);

        if ($data && isset($data['success']) && $data['success'] === true && !empty($data['cookies_sesion'])) {
            $credencialesModel->cookies_sesion = $data['cookies_sesion'];
            $credencialesModel->save();
            return $data['cookies_sesion'];
        }

        return false;
    }
}
