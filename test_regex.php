<?php
$html = file_get_contents('nunoa_raw.html');
$vencimientos = [];
if (preg_match_all('/data-product-id="(\d+)"(?:(?!data-product-id).)*?<span class="product-expiration-date">Vencimiento:\s*([^<]+)<\/span>/s', $html, $matches, PREG_SET_ORDER)) {
    foreach ($matches as $m) {
        $vencimientos[$m[1]] = trim($m[2]);
    }
}
print_r($vencimientos);
