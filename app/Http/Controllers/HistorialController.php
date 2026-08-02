<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class HistorialController extends Controller
{
    /**
     * Muestra el historial de ingresos de mercadería (compras a proveedores).
     */
    public function ingresosMercaderia()
    {
        // Usamos Eloquent para traer los ingresos con su proveedor y los lotes que ingresaron (con sus productos)
        $ingresos = \App\Models\IngresoMercaderia::with([
            'proveedor:id_proveedor,nombre_empresa,identificacion_fiscal',
            'lotesHistoria.producto:id_producto,nombre_comercial,codigo_barras'
        ])
        ->orderBy('fecha_ingreso', 'desc')
        ->orderBy('id_ingreso', 'desc')
        ->get();

        // Opcional: Podríamos querer mostrar el total en dinero o cuántos lotes se ingresaron.
        // Por ahora, enviaremos la tabla básica y la embellecemos en React.
        
        return Inertia::render('Historial/Ingresos_historico', [
            'ingresos' => $ingresos
        ]);
    }

    /**
     * Muestra el historial de ajustes y mermas de inventario.
     */
    public function movimientosMercaderia()
    {
        $movimientos = \App\Models\MovimientoMercaderia::with([
            'producto:id_producto,nombre_comercial,codigo_barras',
            'usuario:id,name'
        ])
        ->orderBy('fecha_hora', 'desc')
        ->orderBy('id_movimiento', 'desc')
        ->get();

        return Inertia::render('Historial/Mercaderia', [
            'movimientos' => $movimientos
        ]);
    }
}
