<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class CheckRole
{
    /**
     * Handle an incoming request.
     *
     * @param  \Closure(\Illuminate\Http\Request): (\Symfony\Component\HttpFoundation\Response)  $next
     */
    public function handle(Request $request, Closure $next, ...$roles): Response
    {
        if (!auth()->check()) {
            return redirect('/login');
        }

        $userRol = auth()->user()->rol;

        // El Administrador tiene acceso total a todo
        if ($userRol === 'Administrador') {
            return $next($request);
        }

        // Si el usuario tiene otro rol (ej. Cajero), verificamos que esté en la lista permitida
        if (!in_array($userRol, $roles)) {
            abort(403, 'No tienes los permisos necesarios para acceder a esta sección.');
        }

        return $next($request);
    }
}
