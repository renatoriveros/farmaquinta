<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TurnoCajaController;

// 1. PÁGINA DE INICIO (Pública)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 2. SISTEMA RxPOS (Rutas Protegidas: Solo usuarios logueados)
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Al iniciar sesión, Laravel busca "/dashboard". Lo redirigimos a tu Punto de Venta.
    Route::get('/dashboard', function () {
        return redirect()->route('venta');
    })->name('dashboard');

    // Módulos principales de la Farmacia
    Route::get('/venta', function () {
        return Inertia::render('Venta');
    })->name('venta');

    Route::get('/stock', function () {
        return Inertia::render('Stock');
    })->name('stock');

    Route::get('/historial', function () {
        return Inertia::render('HistorialCompras');
    })->name('historial');

    // Gestión del Perfil (Predeterminado de Laravel)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');
    Route::post('/turno/abrir', [TurnoCajaController::class, 'abrir'])->name('turno.abrir');
});

require __DIR__.'/auth.php';