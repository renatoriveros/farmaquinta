<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function login(Request $request)
    {
        $request->validate([
            'email' => 'required|email',
            'password' => 'required'
        ]);

        $user = User::where('email', $request->email)->first();

        if (! $user || ! Hash::check($request->password, $user->password)) {
            return response()->json(['mensaje' => 'Credenciales inválidas'], 401);
        }

        // Generamos el token de seguridad
        $token = $user->createToken('token_farmaquinta')->plainTextToken;

        return response()->json([
            'mensaje' => 'Bienvenido al sistema Farmaquinta',
            'usuario' => $user->name,
            'token' => $token
        ]);
    }
}