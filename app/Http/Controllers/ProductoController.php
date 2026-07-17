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

        // Buscamos por código de barras exacto O que el nombre contenga el texto
        $productos = Producto::where('codigo_barras', $termino)
            ->orWhere('nombre_comercial', 'LIKE', "%{$termino}%")
            ->orWhere('principio_activo', 'LIKE', "%{$termino}%")
            ->where('activo', true) // Solo productos activos
            ->take(15) // Limitamos a 15 resultados para no saturar la pantalla
            ->get();

        return response()->json($productos);
    }
}