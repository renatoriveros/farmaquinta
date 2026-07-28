<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Venta;
use App\Models\LotesInventario;
use App\Models\DetalleVenta;
use App\Models\Producto;
use Exception;

class VentaController extends Controller
{
    public function procesarVenta(Request $request)
    {

        $request->validate([

            'carrito'       => 'required|array|min:1',
            'total_venta'   => 'required|numeric',
            'descuento'     => 'required|numeric',
            'metodo_pago'   => 'required|string',
            'id_sucursal'   => 'required|integer',
            'id_turno'      => 'required|integer',
            'folio_receta'  => 'nullable|string',
            'pago_recibido' => 'nullable|numeric', 
            'vuelto'        => 'nullable|numeric'
        ]);
        
        DB::beginTransaction();

        try {
            
         $venta = new Venta();
            
            $venta->id_sucursal   = $request->id_sucursal; 
            $venta->id_turno      = $request->id_turno; 
            $venta->id_usuario    = auth()->id(); 
            $venta->fecha_hora    = now();
            $venta->metodo_pago   = $request->metodo_pago;
            $venta->folio_receta  = $request->folio_receta; 
            $venta->total_venta   = $request->total_venta;
            $venta->pago_recibido = $request->pago_recibido;
            $venta->vuelto        = $request->vuelto;
            
            $venta->save();
    // 1. ANTES del bucle, calculamos los totales globales para saber el "peso" de cada producto
            $subtotalGlobal = 0;
            $totalItems = 0;
            foreach ($request->carrito as $item) {
                $subtotalGlobal += ($item['cantidad'] * $item['precio_venta']);
                $totalItems += $item['cantidad'];
            }
            $descuentoTotalGlobal = $request->descuento ?? 0;
            $descuentoAcumuladoAplicado = 0; 
            $itemsProcesados = 0;

            // 3. Procesar el Carrito y aplicar lógica FIFO a los Lotes
            foreach ($request->carrito as $item) {
                $cantidadRequerida = $item['cantidad'];

                // Buscar los lotes con stock para este producto, ordenados por fecha de caducidad
                $lotes = LotesInventario::where('id_producto', $item['id_producto'])
                            ->where('cantidad_disponible', '>', 0)
                            ->orderBy('fecha_caducidad', 'asc')
                            ->lockForUpdate() // Evita que 2 cajeros vendan la misma caja al mismo tiempo
                            ->get();

                foreach ($lotes as $lote) {
                    if ($cantidadRequerida <= 0) break; // Ya completamos este producto

                    // ¿Cuánto podemos sacar de este lote? 
                    $cantidadADescontar = min($lote->cantidad_disponible, $cantidadRequerida);

                    // Descontar del lote y guardar
                    $lote->cantidad_disponible -= $cantidadADescontar;
                    $lote->save();

                    // === LÓGICA DE PRORRATEO DE DESCUENTO ===
                    $subtotalFila = $cantidadADescontar * $item['precio_venta'];
                    
                    // Calculamos cuánto descuento le toca a esta fila según su peso en la venta total
                    $descuentoFila = 0;
                    if ($subtotalGlobal > 0) {
                        $descuentoFila = round(($subtotalFila / $subtotalGlobal) * $descuentoTotalGlobal);
                    }

                    // Para evitar descuadres por redondeo (el clásico peso perdido),
                    // si estamos procesando la última unidad de toda la venta, le asignamos el resto exacto.
                    $itemsProcesados += $cantidadADescontar;
                    if ($itemsProcesados == $totalItems) {
                        $descuentoFila = $descuentoTotalGlobal - $descuentoAcumuladoAplicado;
                    }
                    
                    $descuentoAcumuladoAplicado += $descuentoFila;
                    // =======================================

                    // Registrar el detalle exacto indicando de qué lote salió
                    $detalle = new DetalleVenta();
                    $detalle->id_venta = $venta->id_venta; 
                    $detalle->id_producto = $item['id_producto'];
                    $detalle->id_lote = $lote->id_lote;
                    $detalle->cantidad = $cantidadADescontar;
                    $detalle->precio_unitario = $item['precio_venta']; 
                    
                    // Guardamos el descuento que le corresponde a este registro en particular
                    $detalle->descuento = $descuentoFila; 
                    
                    $detalle->save();

                    // Restar lo que ya procesamos de la cantidad solicitada
                    $cantidadRequerida -= $cantidadADescontar;
                }

                // Barrera de seguridad por si el stock físico no coincide con el digital
                if ($cantidadRequerida > 0) {
                    throw new \Exception("Stock insuficiente en el lote para procesar el producto " . $item['id_producto']);
                }
            }

            // 4. Si todo salió perfecto, confirmamos los cambios en la Base de Datos
        DB::commit();

            return response()->json([
                'success' => true,
                'mensaje' => 'Venta procesada con éxito',
                'id_venta' => $venta->id_venta
            ]);

        } catch (\Throwable $e) { // <-- CAMBIO CLAVE: Throwable atrapa TODO (Excepciones y Errores fatales)
            // Si hubo cualquier error, deshacemos todo
            DB::rollBack();
            
            // Guardamos el error en el log interno de Laravel por si acaso
            \Log::error('Error crítico en venta: ' . $e->getMessage() . ' en la línea ' . $e->getLine());

            return response()->json([
                'success' => false,
                // Le enviamos a React exactamente qué falló y en qué línea
                'mensaje' => 'Error Backend: ' . $e->getMessage() . ' (Línea ' . $e->getLine() . ')'
            ], 500);
        }
    }
}