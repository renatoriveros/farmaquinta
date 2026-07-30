<?php

namespace App\Http\Controllers;

use App\Models\MovimientoMercaderia;
use App\Models\LotesInventario;
use App\Models\Producto;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Carbon\Carbon;

class MovimientoMercaderiaController extends Controller
{
    public function create()
    {
        return Inertia::render('Stock/Extras');
    }

    public function store(Request $request)
    {
        // 1. Validar los datos que vienen del frontend
        $validated = $request->validate([
            'tipo_movimiento' => 'required|in:entrada,salida',
            'motivo'          => 'required|string',
            'id_producto'     => 'required|integer', 
            'numero_lote'     => 'required|string',
            'cantidad'        => 'required|integer|min:1',
            'observaciones'   => 'nullable|string'
        ]);

        $validated['fecha_hora'] = Carbon::now();
        $validated['id_usuario'] = auth()->id(); 
        DB::beginTransaction();

        try {
            // A. Registrar el movimiento en el historial
            MovimientoMercaderia::create($validated);

            // B. Actualizar el stock en el lote específico
            $lote = LotesInventario::where('id_producto', $validated['id_producto'])
                                  ->where('numero_lote', $validated['numero_lote'])
                                  ->firstOrFail();

            if ($validated['tipo_movimiento'] === 'salida') {
                // Validar que haya suficiente stock antes de restar
                if ($lote->cantidad_disponible < $validated['cantidad']) {
                    throw new \Exception('No hay stock suficiente en este lote para realizar la salida.');
                }
                $lote->cantidad_disponible -= $validated['cantidad'];
            } else {
                $lote->cantidad_disponible += $validated['cantidad'];
            }

            $lote->save();

            DB::commit();

            return redirect()->back()->with('success', 'Movimiento registrado y stock actualizado.');

        } catch (\Exception $e) {
            DB::rollBack();
            return redirect()->back()->withErrors(['error' => $e->getMessage()]);
        }
    }
    public function buscarPorCodigo($codigo)
    {
        // Buscamos el producto por código de barras y cargamos sus lotes asociados
        $producto = Producto::with('lotes') 
            ->where('codigo_barras', $codigo)
            ->first();

        if ($producto) {
            return response()->json([
                'success' => true, 
                'producto' => $producto
            ]);
        }

        return response()->json([
            'success' => false, 
            'message' => 'Producto no encontrado'
        ], 404);
    }
}