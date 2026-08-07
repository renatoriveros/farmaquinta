<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class DashboardController extends Controller
{
    private function aplicarFiltroFechas($query, $rango, $desde, $hasta, $columna = 'fecha_hora')
    {
        $hoy = Carbon::now();

        if ($rango === 'hoy') {
            return $query->whereDate($columna, $hoy->toDateString());
        }

        if ($rango === 'semana') {
            return $query->whereBetween($columna, [$hoy->copy()->startOfWeek(), $hoy->copy()->endOfWeek()]);
        }
        
        if ($rango === 'mes') {
            return $query->whereBetween($columna, [$hoy->copy()->startOfMonth(), $hoy->copy()->endOfMonth()]);
        }

        if ($rango === 'mes_anterior') {
            return $query->whereBetween($columna, [$hoy->copy()->subMonth()->startOfMonth(), $hoy->copy()->subMonth()->endOfMonth()]);
        }

        if ($rango === '2_meses') {
            return $query->whereBetween($columna, [$hoy->copy()->subMonths(2)->startOfDay(), $hoy->copy()->endOfDay()]);
        }

        if ($rango === '6_meses') {
            return $query->whereBetween($columna, [$hoy->copy()->subMonths(6)->startOfDay(), $hoy->copy()->endOfDay()]);
        }

        if ($rango === 'anual') {
            return $query->whereBetween($columna, [$hoy->copy()->startOfYear(), $hoy->copy()->endOfYear()]);
        }

        if ($rango === 'personalizado' && $desde && $hasta) {
            return $query->whereBetween($columna, [Carbon::parse($desde)->startOfDay(), Carbon::parse($hasta)->endOfDay()]);
        }

        // Default: hoy
        return $query->whereDate($columna, $hoy->toDateString());
    }

    public function rendimientoVentas(Request $request)
    {
        $rango = $request->query('rango', 'hoy');
        $desde = $request->query('desde');
        $hasta = $request->query('hasta');
        
        $query = DB::table('ventas');
        $queryGrafico = DB::table('ventas');
        
        // Aplicar filtros
        $query = $this->aplicarFiltroFechas($query, $rango, $desde, $hasta, 'fecha_hora');
        $queryGrafico = $this->aplicarFiltroFechas($queryGrafico, $rango, $desde, $hasta, 'fecha_hora');
        
        $groupBy = ($rango === 'hoy') ? 'hora' : 'dia';

        // KPIs Rápidos (1 consulta masiva para no saturar RAM)
        $kpis = $query->selectRaw('
            SUM(total_venta) as total_vendido,
            COUNT(id_venta) as total_boletas,
            SUM(total_venta) / NULLIF(COUNT(id_venta), 0) as ticket_promedio
        ')->first();

        // Datos para el gráfico
        if ($groupBy === 'hora') {
            $grafico = $queryGrafico->selectRaw('
                HOUR(fecha_hora) as label,
                SUM(total_venta) as total
            ')
            ->groupByRaw('HOUR(fecha_hora)')
            ->orderByRaw('HOUR(fecha_hora)')
            ->get();
            
            // Formatear horas
            $grafico = $grafico->map(function($item) {
                return [
                    'label' => str_pad($item->label, 2, '0', STR_PAD_LEFT) . ':00',
                    'total' => (float)$item->total
                ];
            });
        } else {
            $grafico = $queryGrafico->selectRaw('
                DATE(fecha_hora) as label,
                SUM(total_venta) as total
            ')
            ->groupByRaw('DATE(fecha_hora)')
            ->orderByRaw('DATE(fecha_hora)')
            ->get();

            // Formatear fechas
            $grafico = $grafico->map(function($item) {
                return [
                    'label' => Carbon::parse($item->label)->format('d M'),
                    'total' => (float)$item->total
                ];
            });
        }

        return Inertia::render('Dashboards/RendimientoVentas', [
            'kpis' => [
                'total_vendido' => $kpis->total_vendido ?? 0,
                'total_boletas' => $kpis->total_boletas ?? 0,
                'ticket_promedio' => $kpis->ticket_promedio ?? 0
            ],
            'grafico' => $grafico,
            'filtros' => [
                'rango' => $rango,
                'desde' => $desde,
                'hasta' => $hasta
            ]
        ]);
    }

    public function productos(Request $request)
    {
        $rango = $request->query('rango', 'hoy');
        $desde = $request->query('desde');
        $hasta = $request->query('hasta');

        // Construir la consulta base para el filtrado de fechas
        $ventasQuery = DB::table('ventas')->select('id_venta');
        $ventasQuery = $this->aplicarFiltroFechas($ventasQuery, $rango, $desde, $hasta, 'fecha_hora');

        // Top 10 Más Vendidos (Por Cantidad)
        $topCantidad = DB::table('detalle_ventas')
            ->join('productos', 'detalle_ventas.id_producto', '=', 'productos.id_producto')
            ->joinSub($ventasQuery, 'v', function ($join) {
                $join->on('detalle_ventas.id_venta', '=', 'v.id_venta');
            })
            ->selectRaw('
                productos.nombre_comercial as nombre,
                productos.codigo_barras,
                SUM(detalle_ventas.cantidad) as total_unidades
            ')
            ->groupBy('productos.id_producto', 'productos.nombre_comercial', 'productos.codigo_barras')
            ->orderByDesc('total_unidades')
            ->limit(10)
            ->get();

        // Top 10 Más Rentables (Por Dinero)
        $topRentabilidad = DB::table('detalle_ventas')
            ->join('productos', 'detalle_ventas.id_producto', '=', 'productos.id_producto')
            ->joinSub($ventasQuery, 'v', function ($join) {
                $join->on('detalle_ventas.id_venta', '=', 'v.id_venta');
            })
            ->selectRaw('
                productos.nombre_comercial as nombre,
                productos.codigo_barras,
                SUM(detalle_ventas.subtotal) as total_dinero
            ')
            ->groupBy('productos.id_producto', 'productos.nombre_comercial', 'productos.codigo_barras')
            ->orderByDesc('total_dinero')
            ->limit(10)
            ->get();

        return Inertia::render('Dashboards/InteligenciaProductos', [
            'top_cantidad' => $topCantidad,
            'top_rentabilidad' => $topRentabilidad,
            'filtros' => [
                'rango' => $rango,
                'desde' => $desde,
                'hasta' => $hasta
            ]
        ]);
    }

    public function analisis(Request $request)
    {
        $rango = $request->query('rango', 'hoy');
        $desde = $request->query('desde');
        $hasta = $request->query('hasta');

        // Construir la consulta base para el filtrado de fechas
        $ventasQuery = DB::table('ventas')->select('id_venta');
        $ventasQuery = $this->aplicarFiltroFechas($ventasQuery, $rango, $desde, $hasta, 'fecha_hora');

        // Huesos (Productos inactivos o que no se han vendido en el rango seleccionado)
        $productosVendidosIds = DB::table('detalle_ventas')
            ->joinSub($ventasQuery, 'v', function ($join) {
                $join->on('detalle_ventas.id_venta', '=', 'v.id_venta');
            })
            ->pluck('id_producto');

        $huesos = DB::table('productos')
            ->join('lotes_inventario', 'productos.id_producto', '=', 'lotes_inventario.id_producto')
            ->whereNotIn('productos.id_producto', $productosVendidosIds)
            ->selectRaw('
                productos.nombre_comercial as nombre,
                productos.codigo_barras as codigo_barra,
                SUM(lotes_inventario.cantidad_disponible) as stock_actual
            ')
            ->groupBy('productos.id_producto', 'productos.nombre_comercial', 'productos.codigo_barras')
            ->having('stock_actual', '>', 0)
            ->limit(15)
            ->get();

        // Calcular días del período para métricas de velocidad
        $diasPeriodo = 1;
        if ($rango === 'semana') $diasPeriodo = 7;
        elseif ($rango === 'mes') $diasPeriodo = 30;
        elseif ($rango === 'personalizado' && $desde && $hasta) {
            $diff = \Carbon\Carbon::parse($desde)->diffInDays(\Carbon\Carbon::parse($hasta));
            $diasPeriodo = max(1, $diff);
        }

        // Radiografía de Inventario (ABC, Quiebres y Tipo de Venta)
        $radiografia = DB::table('detalle_ventas')
            ->join('productos', 'detalle_ventas.id_producto', '=', 'productos.id_producto')
            ->joinSub($ventasQuery, 'v', function ($join) {
                $join->on('detalle_ventas.id_venta', '=', 'v.id_venta');
            })
            ->selectRaw('
                productos.id_producto,
                productos.nombre_comercial as nombre,
                productos.codigo_barras,
                SUM(detalle_ventas.cantidad) as total_unidades,
                COUNT(DISTINCT detalle_ventas.id_venta) as total_boletas,
                (SELECT COALESCE(SUM(cantidad_disponible), 0) FROM lotes_inventario WHERE id_producto = productos.id_producto) as stock_actual
            ')
            ->groupBy('productos.id_producto', 'productos.nombre_comercial', 'productos.codigo_barras')
            ->orderByDesc('total_unidades')
            ->limit(100)
            ->get()
            ->map(function ($item) use ($diasPeriodo) {
                $item->velocidad_diaria = $item->total_unidades / $diasPeriodo;
                $item->dias_restantes = $item->velocidad_diaria > 0 ? floor($item->stock_actual / $item->velocidad_diaria) : 999;
                $item->unidades_por_boleta = $item->total_boletas > 0 ? round($item->total_unidades / $item->total_boletas, 1) : 0;
                
                if ($item->velocidad_diaria >= 1) $item->clasificacion = 'A';
                elseif ($item->velocidad_diaria >= 0.2) $item->clasificacion = 'B';
                else $item->clasificacion = 'C';

                if ($item->unidades_por_boleta <= 1.5) $item->tipo_venta = 'Hormiga';
                elseif ($item->unidades_por_boleta <= 3) $item->tipo_venta = 'Normal';
                else $item->tipo_venta = 'Lote';

                return $item;
            });

        return Inertia::render('Dashboards/AnalisisVentas', [
            'huesos' => $huesos,
            'radiografia' => $radiografia,
            'filtros' => [
                'rango' => $rango,
                'desde' => $desde,
                'hasta' => $hasta
            ]
        ]);
    }

    public function flujo(Request $request)
    {
        $rango = $request->query('rango', 'hoy');
        $desde = $request->query('desde');
        $hasta = $request->query('hasta');

        // Consultas base con filtro de fechas
        $ventasQuery = DB::table('ventas');
        $movimientosQuery = DB::table('movimientos_caja');
        $comprasQuery = DB::table('ingresos_mercaderia');

        $ventasQuery = $this->aplicarFiltroFechas($ventasQuery, $rango, $desde, $hasta, 'fecha_hora');
        $movimientosQuery = $this->aplicarFiltroFechas($movimientosQuery, $rango, $desde, $hasta, 'fecha_hora');
        $comprasQuery = $this->aplicarFiltroFechas($comprasQuery, $rango, $desde, $hasta, 'fecha_ingreso');

        // 1. Ingresos por Ventas
        $ingresosVentas = $ventasQuery->sum('total_venta') ?? 0;

        // 2. Ingresos Extras (Manuales)
        $ingresosExtras = (clone $movimientosQuery)->where('tipo_movimiento', 'ingreso')->sum('monto') ?? 0;

        // 3. Egresos Manuales (Caja)
        $egresosCaja = (clone $movimientosQuery)->where('tipo_movimiento', 'egreso')->sum('monto') ?? 0;

        // 4. Egresos por Compras de Mercadería (Facturas a Proveedores)
        $egresosCompras = $comprasQuery->sum('total_compra') ?? 0;

        $totalIngresos = $ingresosVentas + $ingresosExtras;
        $totalEgresos = $egresosCaja + $egresosCompras;
        $flujoNeto = $totalIngresos - $totalEgresos;

        // 5. Stock Valorizado (Global, sin importar la fecha, es el valor actual en bodega)
        // Se multiplica la cantidad de cada lote por su costo de adquisición
        $stockValorizado = DB::table('lotes_inventario')
            ->where('cantidad_disponible', '>', 0)
            ->selectRaw('SUM(cantidad_disponible * costo_adquisicion) as valor_total')
            ->value('valor_total') ?? 0;
            
        // Preparamos los datos para el Gráfico Circular (Pie Chart)
        $grafico = [
            ['name' => 'Ventas (Ingresos)', 'value' => (float)$ingresosVentas, 'color' => '#10b981'], // Verde
            ['name' => 'Ingresos Extras', 'value' => (float)$ingresosExtras, 'color' => '#3b82f6'],   // Azul
            ['name' => 'Egresos Caja', 'value' => (float)$egresosCaja, 'color' => '#f59e0b'],         // Naranja
            ['name' => 'Pago Proveedores', 'value' => (float)$egresosCompras, 'color' => '#ef4444'],  // Rojo
        ];

        return Inertia::render('Dashboards/FlujoCaja', [
            'finanzas' => [
                'ingresos_ventas' => $ingresosVentas,
                'ingresos_extras' => $ingresosExtras,
                'total_ingresos' => $totalIngresos,
                'egresos_caja' => $egresosCaja,
                'egresos_compras' => $egresosCompras,
                'total_egresos' => $totalEgresos,
                'flujo_neto' => $flujoNeto,
            ],
            'stock_valorizado' => $stockValorizado,
            'grafico' => $grafico,
            'filtros' => [
                'rango' => $rango,
                'desde' => $desde,
                'hasta' => $hasta
            ]
        ]);
    }
}
