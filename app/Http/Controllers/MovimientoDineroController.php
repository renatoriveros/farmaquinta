<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MovimientoDineroController extends Controller
{
    public function create()
    {
        $turnoActual = $this->obtenerTurnoActivo();
        $isAdmin = auth()->user()->rol === 'Administrador';

        if (!$turnoActual && !$isAdmin) {
            return Inertia::render('Stock/Dinero', [
                'error_turno' => 'No hay un turno abierto. Debes abrir la caja antes de registrar movimientos.',
                'saldo_disponible' => 0
            ]);
        }

        if ($turnoActual) {
            $desglose = $this->calcularDesgloseCaja($turnoActual);
            $saldoDisponible = $desglose['saldo'];
            $desgloseArr = [
                'apertura' => $desglose['apertura'],
                'ventas' => $desglose['ventas'],
                'ingresos' => $desglose['ingresos'],
                'egresos' => $desglose['egresos'],
            ];
        } else {
            // Es Administrador sin turno activo (Mueve dinero general de la farmacia)
            $saldoDisponible = null; // No hay límite para el administrador
            $desgloseArr = [
                'apertura' => 0, 'ventas' => 0, 'ingresos' => 0, 'egresos' => 0
            ];
        }

        return Inertia::render('Stock/Dinero', [
            'turno_activo' => $turnoActual ? true : false,
            'id_turno' => $turnoActual ? $turnoActual->id_turno : null,
            'desglose' => $desgloseArr,
            'saldo_disponible' => $saldoDisponible
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'tipo_movimiento' => 'required|in:ingreso,egreso',
            'monto' => 'required|numeric|min:1',
            'motivo' => 'required|string|max:255',
            'observaciones' => 'nullable|string'
        ]);

        $turnoActual = $this->obtenerTurnoActivo();
        $isAdmin = auth()->user()->rol === 'Administrador';

        if (!$turnoActual && !$isAdmin) {
            return back()->withErrors(['error' => 'No hay un turno abierto.']);
        }

        // Si es un egreso y está amarrado a un turno, validar que haya saldo en la caja registradora
        if ($request->tipo_movimiento === 'egreso' && $turnoActual) {
            $desglose = $this->calcularDesgloseCaja($turnoActual);

            if ($request->monto > $desglose['saldo']) {
                return back()->withErrors(['error' => 'No hay suficiente dinero en caja para realizar este retiro.']);
            }
        }

        $concepto = $request->motivo;
        if ($request->observaciones) {
            $concepto .= ' - ' . $request->observaciones;
        }

        DB::table('movimientos_caja')->insert([
            'id_turno' => $turnoActual ? $turnoActual->id_turno : null,
            'tipo_movimiento' => $request->tipo_movimiento,
            'monto' => $request->monto,
            'concepto' => $concepto,
            'fecha_hora' => now()
        ]);

        return redirect()->back()->with('success', 'Movimiento registrado exitosamente.');
    }

    /**
     * Calcula el desglose de dinero y saldo final para un turno específico
     */
    private function calcularDesgloseCaja($turno)
    {
        $idTurno = $turno->id_turno;
        $montoApertura = $turno->monto_apertura;

        $ventasEfectivo = DB::table('ventas')
                            ->where('id_turno', $idTurno)
                            ->where('metodo_pago', 'Efectivo')
                            ->sum('total_venta');

        $ingresosExtras = DB::table('movimientos_caja')
                            ->where('id_turno', $idTurno)
                            ->where('tipo_movimiento', 'ingreso')
                            ->sum('monto');

        $egresos = DB::table('movimientos_caja')
                        ->where('id_turno', $idTurno)
                        ->where('tipo_movimiento', 'egreso')
                        ->sum('monto');

        $saldoDisponible = $montoApertura + $ventasEfectivo + $ingresosExtras - $egresos;

        return [
            'apertura' => $montoApertura,
            'ventas' => $ventasEfectivo,
            'ingresos' => $ingresosExtras,
            'egresos' => $egresos,
            'saldo' => $saldoDisponible
        ];
    }

    /**
     * Obtiene el turno activo. El Administrador puede ver cualquier turno abierto de la sucursal,
     * mientras que el Cajero solo puede ver su propio turno.
     */
    private function obtenerTurnoActivo()
    {
        $query = DB::table('turnos_caja')->where('estado', 'Abierto');

        if (auth()->user()->rol !== 'Administrador') {
            $query->where('id_usuario', auth()->id());
        }

        return $query->first();
    }
}