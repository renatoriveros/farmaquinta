<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use App\Models\TurnoCaja;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): ?string
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     *
     * @return array<string, mixed>
     */
  public function share(Request $request): array
{
    $user = $request->user();
    $turnoActivo = null;

    // Solo si el usuario está logueado y es Cajero, buscamos si tiene un turno "Abierto"
    if ($user && $user->rol === 'Cajero') {
        $turnoActivo = TurnoCaja::where('id_usuario', $user->id)
            ->where('estado', 'Abierto')
            ->first();
    }

    return array_merge(parent::share($request), [
        'auth' => [
            'user' => $user,
            // Si tiene turno abierto mandamos los datos, si no, mandamos null
            'turno_activo' => $turnoActivo, 
        ],
    ]);
}
}
