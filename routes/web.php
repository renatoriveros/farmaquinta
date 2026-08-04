<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;
use App\Http\Controllers\TurnoCajaController;
use App\Http\Controllers\ProductoController;
use App\Http\Controllers\VentaController;
use App\Http\Controllers\IngresoMercaderiaController;
use App\Http\Controllers\CategoriaController;
use App\Http\Controllers\ProveedorController;
use App\Http\Controllers\MovimientoMercaderiaController;
use App\Http\Controllers\GestionController;
use App\Http\Controllers\MovimientoDineroController;
use App\Http\Controllers\HistorialController;

// 1. PÁGINA DE INICIO (Pública)
Route::get('/', function () {
    return Inertia::render('Welcome', [
        'canLogin' => Route::has('login'),
        'canRegister' => Route::has('register'),
        'laravelVersion' => Application::VERSION,
        'phpVersion' => PHP_VERSION,
    ]);
});

// Rutas Protegidas usuarios logueados)
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

    


    // GRUPO DE RUTAS NUEVO (Solo Administrador)
    Route::prefix('nuevo')->middleware('role:Administrador')->group(function () {
        Route::get('/producto', [ProductoController::class, 'create'])->name('nuevo.producto');
        Route::post('/producto', [ProductoController::class, 'NuevoRemedio'])->name('ingreso.nuevo.producto');

        Route::get('/proveedor', [ProveedorController::class, 'create'])->name('nuevo.proveedor');
        Route::post('/proveedor', [ProveedorController::class, 'store'])->name('ingreso.nuevo.proveedor');
        
        Route::get('/activar-producto', [ProductoController::class, 'gestionar'])->name('activar-producto');
        Route::post('/producto/{id_producto}/toggle', [ProductoController::class, 'toggleActivo'])->name('nuevo.producto.toggle');
    });
    
    // GRUPO DE RUTAS STOCK
    
    Route::prefix('stock')->name('stock.')->group(function () {

        //rutas para ingreso.
        Route::get('/ingreso', [IngresoMercaderiaController::class, 'index'])->name('ingreso');
        Route::post('/ingreso/previsualizar', [IngresoMercaderiaController::class, 'previsualizar'])->name('ingreso.previsualizar');
        Route::post('/ingreso/guardar', [IngresoMercaderiaController::class, 'guardarLote'])->name('ingreso.guardar');
        
        //Govimientos extras
        Route::get('/movimientos', [MovimientoMercaderiaController::class, 'create'])->name('movimientos');
        //buscar codigo para saber cual sacar y todos sus lotes
        Route::get('/buscar-producto/{codigo}', [MovimientoMercaderiaController::class, 'buscarPorCodigo']);
        // Guardar el movimiento en BD
        Route::post('/movimientos', [MovimientoMercaderiaController::class, 'store'])->name('movimientos.store');
         
        //Gestion De Lotes
        Route::get('/gestion', [GestionController::class, 'index'])->name('gestion');

        //Movimientos de Dineros (Solo Administrador)
        Route::middleware('role:Administrador')->group(function () {
            Route::get('/dinero', [MovimientoDineroController::class, 'create'])->name('MovimientosPlata');
            Route::post('/dinero', [MovimientoDineroController::class, 'store'])->name('dinero.store');
        });
        
        


      

    });

    // GRUPO DE RUTAS HISTORIAL
    Route::prefix('historial')->name('historial.')->group(function () {
        // Redirigir el index principal a mercaderia por defecto, o mostrar un dashboard de historial
        Route::get('/', function () { return redirect()->route('historial.mercaderia'); })->name('index');
        
        // Historial de Ingresos de Mercadería (Compras)
        Route::get('/mercaderia', [HistorialController::class, 'ingresosMercaderia'])->name('mercaderia');
        
        // Aquí irán las futuras rutas:
        Route::get('/ventas', [HistorialController::class, 'ventas'])->name('ventas');
        Route::get('/movimientos-mercaderia', [HistorialController::class, 'movimientosMercaderia'])->name('movimientos-mercaderia');
        
        // Solo Administrador
        Route::middleware('role:Administrador')->get('/movimientos-dinero', [HistorialController::class, 'movimientosDinero'])->name('movimientos-dinero');
        
        Route::get('/caja', [HistorialController::class, 'cierresCaja'])->name('caja');
        // Route::get('/turnos', [HistorialController::class, 'turnos'])->name('turnos');
    });

    // Gestión del Perfil (Predeterminado de Laravel)
    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::post('/turno/abrir', [TurnoCajaController::class, 'abrir'])->name('turno.abrir');
    Route::post('/turno/cerrar', [TurnoCajaController::class, 'cerrar'])->name('turno.cerrar');
    Route::get('/api/buscar-producto', [ProductoController::class, 'buscarPuntoVenta'])->name('api.productos.buscar');
    Route::post('/procesar-venta', [VentaController::class, 'procesarVenta'])->name('api.ventas.procesar');
    Route::post('/ingreso/previsualizar-xml', [IngresoMercaderiaController::class, 'previsualizar'])->name('ingreso.previsualizar-xml');
    Route::post('/api/ingresos/guardar-lote', [IngresoMercaderiaController::class, 'guardarLote'])->name('api.ingresos.guardar-lote');
});

require __DIR__.'/auth.php';