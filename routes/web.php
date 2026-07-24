<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TurnoCajaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\IngresoMercaderiaController;

// 1. PÁGINA DE INICIO (Pública)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// 2.(Rutas Protegidas: Solo usuarios logueados)
Route::middleware(['auth', 'verified'])->group(function () {
    
    // Al iniciar sesión, Laravel busca "/dashboard". Lo redirigimos a tu Punto de Venta.
    Route::get('/dashboard', function () {
        return redirect()->route('venta');
    })->name('dashboard');

    // Módulos principales de la Farmacia
    Route::get('/venta', function () {
        return Inertia::render('Venta');
    })->name('venta');

    Route::get('/ingreso', function () {
        return Inertia::render('Ingreso');
    })->name('ingreso');

    Route::get('/historial', function () {
        return Inertia::render('HistorialCompras');
    })->name('historial');

    // Gestión del Perfil (Predeterminado de Laravel)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/turno/abrir', [TurnoCajaController::class, 'abrir'])->name('turno.abrir');
    Route::get('/api/buscar-producto', [ProductoController::class, 'buscarPuntoVenta'])->name('api.productos.buscar');
    Route::post('/procesar-venta', [VentaController::class, 'procesarVenta'])->name('api.ventas.procesar');
    Route::post('/ingreso/previsualizar-xml', [IngresoMercaderiaController::class, 'previsualizar'])->name('ingreso.previsualizar-xml');
    Route::post('/api/ingresos/guardar-lote', [IngresoMercaderiaController::class, 'guardarLote'])->name('api.ingresos.guardar-lote');
});

require __DIR__.'/auth.php';