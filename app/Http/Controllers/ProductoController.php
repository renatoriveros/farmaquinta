<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;

class ProductoController extends Controller
{
    public function buscarPuntoVenta(Request $request)
    {
        $termino = $request->query('q');

        if (!$termino) {
            return response()->json([]);
        }

        
        $productos = Producto::where('activo', true)
            // 1.  Solo productos que tengan lotes con cantidad > 0 y no vencidos
            ->whereHas('lotes', function ($query) {
                $query->where('cantidad_disponible', '>', 0)
                      ->where('fecha_caducidad', '>=', now());
            })
            // 2. SUMAR STOCK: Crea una nueva columna "lotes_sum_cantidad_disponible" al vuelo
            ->withSum(['lotes' => function ($query) {
                $query->where('cantidad_disponible', '>', 0)
                      ->where('fecha_caducidad', '>=', now());
            }], 'cantidad_disponible')
            // 3. FILTRAR POR TEXTO (Código, Nombre o Principio Activo)
            ->where(function ($query) use ($termino) {
                $query->where('codigo_barras', $termino)
                      ->orWhere('nombre_comercial', 'LIKE', "%{$termino}%")
                      ->orWhere('principio_activo', 'LIKE', "%{$termino}%");
            })
            ->take(15) // Tu límite de 15 resultados
            ->get();

        return response()->json($productos);
    }
}