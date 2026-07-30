<?php

namespace App\Imports;

use App\Models\CatalogoProveedor;
use App\Models\Producto; // Importamos tu modelo original
use Illuminate\Support\Collection;
use Maatwebsite\Excel\Concerns\ToCollection;
use Maatwebsite\Excel\Concerns\WithChunkReading;
use Maatwebsite\Excel\Concerns\WithHeadingRow;

class CatalogoImport implements ToCollection, WithChunkReading, WithHeadingRow
{
    protected $idProveedor;
    protected $codigoProveedor;

    protected $diccionario = [
        'mediven' => [
            'fila_encabezados' => 9,
            'mapa' => [
                'codigo' => 'barcode',      
                'nombre' => 'descripcion',
                'precio' => 'oferta',       
            ]
        ],
    ];

    public function __construct($idProveedor, $codigoProveedor)
    {
        $this->idProveedor = $idProveedor;
        $this->codigoProveedor = $codigoProveedor;
    }

    public function headingRow(): int
    {
        return $this->diccionario[$this->codigoProveedor]['fila_encabezados'];
    }

    public function collection(Collection $rows)
    {
        $config = $this->diccionario[$this->codigoProveedor]['mapa'];

        // 1. Recolectar todos los códigos que vienen en ESTE bloque de 1000 filas del Excel
        $codigosEnExcel = [];
        foreach ($rows as $row) {
            $codigoBarras = $row[$config['codigo']] ?? null;
            if ($codigoBarras) {
                $codigosEnExcel[] = trim((string) $codigoBarras);
            }
        }

        // 2. Preguntar a la BD cuáles de estos códigos realmente existen en nuestro sistema
        // Usamos whereIn para hacer una sola consulta rápida por chunk
        $codigosValidos = Producto::whereIn('codigo_barras', $codigosEnExcel)
                                  ->pluck('codigo_barras')
                                  ->toArray();

        $datosParaUpsert = [];

        // 3. Procesar las filas armando el arreglo final
        foreach ($rows as $row) {
            $codigoBarras  = $row[$config['codigo']] ?? null;
            $nombreProducto = $row[$config['nombre']] ?? null;
            $precioCosto   = $row[$config['precio']] ?? null;

            if (!$codigoBarras || !$precioCosto) {
                continue;
            }

            $codigoLimpio = trim((string) $codigoBarras);

            // EL FILTRO MAESTRO: Si el código limpio no está en la lista de válidos de la BD, lo ignoramos
            if (!in_array($codigoLimpio, $codigosValidos)) {
                continue; 
            }

            $datosParaUpsert[] = [
                'id_proveedor'              => $this->idProveedor,
                'codigo_barras'             => $codigoLimpio,
                'nombre_producto_proveedor' => $nombreProducto,
                'precio_costo'              => round(floatval($precioCosto), 2),
                'updated_at'                => now(),
                'created_at'                => now(),
            ];
        }

        // 4. Insertar de golpe solo los que pasaron el filtro
        if (count($datosParaUpsert) > 0) {
            CatalogoProveedor::upsert(
                $datosParaUpsert,
                ['id_proveedor', 'codigo_barras'],
                ['nombre_producto_proveedor', 'precio_costo', 'updated_at'] 
            );
        }
    }

    public function chunkSize(): int
    {
        return 1000;
    }
}