<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Maatwebsite\Excel\Facades\Excel;
use App\Imports\CatalogoImport;

class CatalogoController extends Controller
{
    public function importarExcel(Request $request)
    {
        // Aumentamos la memoria temporalmente para que PhpSpreadsheet pueda leer el .xlsx sin explotar
        ini_set('memory_limit', '512M');

        $request->validate([
            'archivo'          => 'required|mimes:xlsx,xls,csv',
            'id_proveedor'     => 'required|exists:proveedores,id_proveedor',
            'codigo_proveedor' => 'required|string' 
        ]);

        try {
            // Solo pasamos el ID y el código del proveedor al Import
            Excel::import(
                new CatalogoImport($request->id_proveedor, $request->codigo_proveedor), 
                $request->file('archivo')
            );

            return response()->json([
                'success' => true,
                'message' => 'Catálogo importado y actualizado correctamente.'
            ], 200);

        } catch (\Throwable $th) {
            return response()->json([
                'success'       => false,
                'message'       => 'Error al encolar el archivo.',
                'error_detalle' => $th->getMessage()
            ], 500);
        }
    }
}