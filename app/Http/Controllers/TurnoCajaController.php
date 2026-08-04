<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TurnoCaja;
use App\Models\Venta;
use App\Models\MovimientoCaja;
use Illuminate\Support\Facades\Auth;

class TurnoCajaController extends Controller
{
    public function abrir(Request $request)
    {
        $request->validate([
            'monto_apertura' => 'required|numeric|min:0',
        ]);

        $user = Auth::user();

        // 1. Validar que no tenga un turno ya abierto (Doble seguridad)
        $existeTurno = TurnoCaja::where('id_usuario', $user->id)
            ->where('estado', 'Abierto')
            ->exists();

        if ($existeTurno) {
            return redirect()->back()->withErrors(['monto_apertura' => 'Ya posees un turno abierto activo.']);
        }

        // 2. Crear la instancia en la base de datos
        TurnoCaja::create([
            'id_usuario'     => $user->id,
            'id_sucursal'    => $user->id_sucursal ?? 1, // Si no tiene sucursal, por defecto la principal
            'monto_apertura' => $request->monto_apertura,
            'fecha_apertura' => now(),
            'estado'         => 'Abierto',
        ]);

        // Redireccionamos de vuelta. Inertia recargará las variables y ocultará el modal.
        return redirect()->back();
    }

    public function cerrar(Request $request)
    {
        $request->validate([
            'monto_declarado_efectivo' => 'required|numeric|min:0',
            'monto_declarado_tarjeta'  => 'required|numeric|min:0',
        ]);

        $user = Auth::user();

        // 1. Obtener el turno abierto actual
        $turno = TurnoCaja::where('id_usuario', $user->id)
            ->where('estado', 'Abierto')
            ->first();

        if (!$turno) {
            return redirect()->back()->withErrors(['error' => 'No tienes un turno abierto para cerrar.']);
        }

        // 2. Calcular el total teórico (Monto Cierre Real en Efectivo)
        
        // a) Apertura
        $apertura = $turno->monto_apertura;

        // b) Ventas en Efectivo
        $ventasEfectivo = Venta::where('id_turno', $turno->id_turno)
            ->where('metodo_pago', 'Efectivo')
            ->sum('total_venta');

        // c) Movimientos de Caja (Ingresos manuales)
        $ingresosCaja = MovimientoCaja::where('id_turno', $turno->id_turno)
            ->where('tipo_movimiento', 'Ingreso')
            ->sum('monto');

        // d) Movimientos de Caja (Retiros/Egresos manuales)
        $egresosCaja = MovimientoCaja::where('id_turno', $turno->id_turno)
            ->where('tipo_movimiento', 'Egreso')
            ->sum('monto');

        // Total Teórico de Efectivo en Caja
        $montoCierreTeorico = $apertura + $ventasEfectivo + $ingresosCaja - $egresosCaja;

        // 3. Actualizar la base de datos
        $turno->update([
            'monto_declarado_efectivo' => $request->monto_declarado_efectivo,
            'monto_declarado_tarjeta'  => $request->monto_declarado_tarjeta,
            'monto_cierre'             => $montoCierreTeorico,
            'fecha_cierre'             => now(),
            'estado'                   => 'Cerrado',
        ]);

        // Redireccionamos. La aplicación detectará que no hay turno y pedirá apertura.
        return redirect()->route('venta');
    }
}