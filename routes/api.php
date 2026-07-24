<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\AuthController;
use App\Http\Controllers\IngresoMercaderiaController;

Route::post('/login', [AuthController::class, 'login']);
// Ruta para previsualizar el XML sin guardarlo aún en la base de datos
Route::post('/ingresos/previsualizar-xml', [IngresoMercaderiaController::class, 'previsualizar']);

