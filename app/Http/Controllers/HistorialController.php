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

    /**
     * Muestra el historial de movimientos de caja (solo admin).
     */
    public function movimientosDinero()
    {
        $movimientos = \App\Models\MovimientoCaja::with([
            'turno.usuario:id,name'
        ])
        ->orderBy('fecha_hora', 'desc')
        ->orderBy('id_movimiento', 'desc')
        ->get();

        return Inertia::render('Historial/Movimientos_dinero', [
            'movimientos' => $movimientos
        ]);
    }
    public function cierresCaja()
    {
        $cierres = \App\Models\TurnoCaja::with('usuario:id,name')
            ->orderBy('fecha_apertura', 'desc')
            ->orderBy('id_turno', 'desc')
            ->get();

        return Inertia::render('Historial/Cierres_caja', [
            'cierres' => $cierres
        ]);
    }

    public function ventas(Request $request)
    {
        $query = \App\Models\Venta::with([
            'usuario:id,name',
            'detalles.producto:id_producto,nombre_comercial'
        ]);

        if ($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search) {
                $q->where('id_venta', 'like', "%{$search}%")
                  ->orWhere('folio_receta', 'like', "%{$search}%")
                  ->orWhereHas('usuario', function($q2) use ($search) {
                      $q2->where('name', 'like', "%{$search}%");
                  });
            });
        }

        if ($request->filled('desde')) {
            $query->whereDate('fecha_hora', '>=', $request->desde);
        }

        if ($request->filled('hasta')) {
            $query->whereDate('fecha_hora', '<=', $request->hasta);
        }

        $ventas = $query->orderBy('fecha_hora', 'desc')
                        ->orderBy('id_venta', 'desc')
                        ->paginate(12)
                        ->withQueryString();

        return Inertia::render('Historial/Ventas', [
            'ventas' => $ventas,
            'filtros' => $request->only(['search', 'desde', 'hasta'])
        ]);
    }
}
