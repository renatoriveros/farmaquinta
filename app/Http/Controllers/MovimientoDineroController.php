<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class MovimientoDineroController extends Controller
{
    /**
     * Muestra el formulario para registrar movimientos de dinero (Ingresos/Egresos)
     */
    public function create()
    {
        $turnoActual = DB::table('turnos_caja')
                        ->where('estado', 'Abierto')
                        ->where('id_usuario', auth()->id())
                        ->first();

        if (!$turnoActual) {
            return Inertia::render('Stock/Dinero', [
                'error_turno' => 'No hay un turno abierto. Debes abrir la caja antes de registrar movimientos.',
                'saldo_disponible' => 0
            ]);
        }

        $desglose = $this->calcularDesgloseCaja($turnoActual);

        return Inertia::render('Stock/Dinero', [
            'turno_activo' => true,
            'id_turno' => $turnoActual->id_turno,
            'desglose' => [
                'apertura' => $desglose['apertura'],
                'ventas' => $desglose['ventas'],
                'ingresos' => $desglose['ingresos'],
                'egresos' => $desglose['egresos'],
            ],
            'saldo_disponible' => $desglose['saldo']
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

        $turnoActual = DB::table('turnos_caja')
                        ->where('estado', 'Abierto')
                        ->where('id_usuario', auth()->id())
                        ->first();

        if (!$turnoActual) {
            return back()->withErrors(['error' => 'No hay un turno abierto.']);
        }

        if ($request->tipo_movimiento === 'egreso') {
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
            'id_turno' => $turnoActual->id_turno,
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
}