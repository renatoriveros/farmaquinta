<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\LotesInventario; // Importamos tu modelo
use Carbon\Carbon; // Para manejar las fechas fácilmente

class NuevoLoteSeeder extends Seeder
{
    public function run(): void
    {
        $hoy = Carbon::now()->toDateString(); // Obtiene la fecha de hoy (Ej: 2026-07-17)

        $$nuevoLote = [
            // Productos Dentales (vencen en 2 años)
            ['id_producto' => 1, 'id_proveedor' => 1, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2028-05-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 2696, 'fecha_ingreso' => $hoy],
            ['id_producto' => 2, 'id_proveedor' => 1, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2028-05-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 3464, 'fecha_ingreso' => $hoy],
            ['id_producto' => 3, 'id_proveedor' => 2, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2028-05-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 1158, 'fecha_ingreso' => $hoy],
            ['id_producto' => 4, 'id_proveedor' => 2, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2028-05-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 1738, 'fecha_ingreso' => $hoy],
            ['id_producto' => 5, 'id_proveedor' => 2, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2028-05-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 3796, 'fecha_ingreso' => $hoy],
            ['id_producto' => 6, 'id_proveedor' => 3, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2028-05-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 3000, 'fecha_ingreso' => $hoy],
            
            // Medicamentos (vencen en 1 año) - Los costos netos son del excel
            ['id_producto' => 7, 'id_proveedor' => 3, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2027-10-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 11623, 'fecha_ingreso' => $hoy],
            ['id_producto' => 8, 'id_proveedor' => 3, 'id_sucursal' => 1, 'numero_lote' => 'LOTE-INICIAL-001', 'fecha_caducidad' => '2027-10-01', 'cantidad_disponible' => 3, 'costo_adquisicion' => 2500, 'fecha_ingreso' => $hoy],
        ];

        // Inyectamos todo el arreglo de golpe en la base de datos
        LotesInventario::insert($nuevoLote);
    }
}