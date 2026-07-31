<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class GestionController extends Controller
{
     public function create()
    {
        return Inertia::render('Stock/Gestion');
    }
    public function index()
    {
        $hoy = Carbon::now();
        $limiteCritico = Carbon::now()->addDays(30);
        $limiteAdvertencia = Carbon::now()->addMonths(6);

        // Traemos todos los lotes que tienen stock disponible (> 0) y su nombre de producto
        $lotesActivos = DB::table('lotes_inventario')
            ->join('productos', 'lotes_inventario.id_producto', '=', 'productos.id_producto')
            ->where('lotes_inventario.cantidad_disponible', '>', 0)
            ->select('lotes_inventario.*', 'productos.nombre_comercial as producto_nombre', 'productos.codigo_barras')
            ->get();

        // Calculamos los KPIs
        $totalLotes = $lotesActivos->count();
        
        $criticos = $lotesActivos->where('fecha_caducidad', '<=', $limiteCritico->toDateString())->count();
        
        $advertencia = $lotesActivos->where('fecha_caducidad', '>', $limiteCritico->toDateString())
                                   ->where('fecha_caducidad', '<=', $limiteAdvertencia->toDateString())
                                   ->count();
                                   
        $sanos = $lotesActivos->where('fecha_caducidad', '>', $limiteAdvertencia->toDateString())->count();

        // Formateamos los lotes para la tabla
        $lotesFormateados = $lotesActivos->map(function($lote) use ($hoy, $limiteCritico, $limiteAdvertencia) {
            $fechaCad = Carbon::parse($lote->fecha_caducidad);
            $dias = $hoy->diffInDays($fechaCad, false); // false para permitir negativos (vencidos)
            
            $estado = 'sano';
            if ($fechaCad <= $limiteCritico) {
                $estado = 'critico';
            } elseif ($fechaCad <= $limiteAdvertencia) {
                $estado = 'advertencia';
            }

            return [
                'id' => $lote->numero_lote . '-' . $lote->id_producto,
                'producto_id' => $lote->id_producto,
                'producto' => $lote->producto_nombre,
                'codigo_barras' => $lote->codigo_barras,
                'lote' => $lote->numero_lote,
                'caducidad' => $fechaCad->format('d/m/Y'),
                'dias' => intval($dias),
                'stock' => $lote->cantidad_disponible,
                'estado' => $estado
            ];
        });

        return Inertia::render('Stock/Gestion', [
            'kpis' => [
                'total' => $totalLotes,
                'criticos' => $criticos,
                'advertencia' => $advertencia,
                'sanos' => $sanos
            ],
            'lotes' => $lotesFormateados
        ]);
    }
}