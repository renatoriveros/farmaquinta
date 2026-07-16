<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\TurnoCaja;
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
}