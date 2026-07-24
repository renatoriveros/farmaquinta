<?php

namespace App\Http\Controllers;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use App\Models\Producto;
use App\Models\IngresoMercaderia;
use App\Models\LotesInventario;
use App\Models\Proveedor;

class IngresoMercaderiaController extends Controller
{
    public function previsualizar(Request $request)
    {
        // 1. Validar que efectivamente venga un archivo y sea XML
        $request->validate([
            'archivo_xml' => 'required|file|mimes:xml'
        ]);

        try {
            // 2. Leer el contenido del archivo
            $xmlContent = file_get_contents($request->file('archivo_xml')->path());
            
            // Truco: Eliminar namespaces (como <sii:DTE>) que a veces complican la lectura en PHP
            $xmlContent = preg_replace('/(<\/?)[a-zA-Z0-9]+:/', '$1', $xmlContent);
            
            // 3. Convertir el texto XML a un Objeto de PHP
            $xml = simplexml_load_string($xmlContent);

            // 4. Navegar por la estructura del DTE (Factura chilena)
            // A veces el XML viene envuelto en <SetDTE><DTE>, otras veces viene directo <Documento>
            $documento = $xml->SetDTE->DTE->Documento ?? $xml->Documento ?? $xml;

            // Extraer datos del Encabezado (Proveedor y Folio)
            $encabezado = $documento->Encabezado;
            $rutProveedor = (string) $encabezado->Emisor->RUTEmisor;
            $razonSocial = (string) $encabezado->Emisor->RznSoc;
            $folio = (string) $encabezado->IdDoc->Folio;
            $fechaEmision = (string) $encabezado->IdDoc->FchEmis;
            $total = (string) $encabezado->Totales->MntTotal;

            // Extraer el Detalle (Los productos)
            $productos = [];
            if (isset($documento->Detalle)) {
                foreach ($documento->Detalle as $item) {
                    
                    $codigobarras = '';
                    $lote = 'SIN LOTE'; // Valor por defecto si no se encuentra el lote
                    // 1. Buscar el EAN y el LOTE entre los múltiples códigos
                if (isset($item->CdgItem)) {
                    foreach ($item->CdgItem as $codigo) {
                        $tipo = (string) $codigo->TpoCodigo;
                        $valor = (string) $codigo->VlrCodigo;

                        if ($tipo === 'EAN13') {
                            $codigobarras = $valor;
                        }
                        
                        if ($tipo === 'LOTE') {
                            $lote = $valor; 
                        }
                    }
                    
                }

                $productos[] = [
                    'nombre_comercial' => (string) $item->DscItem,
                    'codigo_barras' => $codigobarras,
                    'numero_lote' => $lote,
                    'cantidad' => (float) $item->QtyItem,
                    'precio_unitario' => (float) $item->PrcItem,
                    'fecha_caducidad'  => isset($item->FchVencim) ? (string) $item->FchVencim : null,
                    'monto_total' => (float) $item->MontoItem
                ];
            }
        }

        // 5. Retornar los datos limpios en formato JSON
        return response()->json([
            'status' => 'success',
            'datos_factura' => [
                'proveedor' => [
                    'rut' => $rutProveedor,
                    'razon_social' => $razonSocial,
                ],
                'documento' => [
                    'folio' => $folio,
                    'fecha_emision' => $fechaEmision,
                    'monto_total' => $total
                ],
                'productos' => $productos
            ]
        ]);

    } catch (\Exception $e) {
        // Si el XML tiene un formato raro o falla algo, atrapamos el error
        return response()->json([
            'status' => 'error',
            'message' => 'Error al procesar el XML: ' . $e->getMessage()
        ], 422);
    }
 }

    public function guardarLote(Request $request)
    {
        // 1. Extraemos los datos del Payload que armamos en React
        $datosFactura = $request->input('factura');
        $productosXml = $request->input('productos');
        $idSucursal = $request->input('id_sucursal');

        // ==========================================
        // FASE A: VALIDACIONES ESTRICTAS
        // ==========================================

        $codigosXml = collect($productosXml)->pluck('codigo')->toArray();//esto srive para obtener un array de los codigos de los productos que vienen del XML

        // Buscamos cuáles de esos códigos realmente existen en tu tabla de productos
        // NOTA: Ajusta 'codigo_barras' al nombre real de la columna en tu BD
      //  $productosExistentes = Producto::whereIn('codigo_barras', $codigosXml)
                                  //  ->pluck('codigo_barras')
                                    // ->toArray();//toArray pasa de collection a array simple

        // Calculamos la diferencia: ¿Qué códigos están en el XML pero NO en la Base de Datos?
       // $productosFaltantes = array_diff($codigosXml, $productosExistentes);

        // Si hay faltantes, abortamos todo y devolvemos el error 422
       // if (!empty($productosFaltantes)) {
        //    return response()->json([
          //      'error' => 'No se puede procesar el ingreso. Hay productos que no existen en el maestro.',
            //    'codigos_faltantes' => array_values($productosFaltantes) // Se los mandamos a React para mostrarlos
            //], 422);
        //}

        // ==========================================
        // FASE B: TRANSACCIÓN DE BASE DE DATOS
        // ==========================================
        try {
            DB::beginTransaction(); // Empezamos a grabar: Todo o Nada
             $rutProveedor = $datosFactura['id_proveedor'];//con esto obtengo el rut del proveedor que viene del payload de factura, 
             // que aca lo llamamos datosFactura
            
            //busco el proveedor en la base de datos usando el rut que obtuvimos
            $proveedor = Proveedor::where('identificacion_fiscal', $rutProveedor)->first();
            //esto retorna el primer proveedor que encuentre con ese rut
            if (!$proveedor) {
                    return response()->json(['error' => 'El proveedor con RUT ' . $rutProveedor . ' no existe'], 404);
                }
            $ingreso = new IngresoMercaderia();
            $ingreso->id_proveedor = $proveedor->id_proveedor; // Sacamos el ID numérico de la búsqueda anterior
            $ingreso->folio_documento = $datosFactura['folio'];
            $ingreso->ruta_archivo_xml = null; // Si quieres guardar la ruta del XML, hazlo aquí
            $ingreso->estado_cuadratura = 'Cuadrado'; // Si necesitas un valor por defecto
            $ingreso->fecha_ingreso = $datosFactura['fecha_emision'];
            //$ingreso->fecha_ingreso = now(); // Sacamos el ID de la sucursal desde el payload, veo si uso cuando yo lo ingreso
            //o cuando emitieron el xml
            $ingreso->created_at = now();
            $ingreso->updated_at = now();
            $ingreso->save();

            //  Preparamos el array para insertar en el lote
            $lotesParaInsertar = [];
            
            foreach ($productosXml as $prod) {
                // Buscamos el producto que tenga ese codigo de barras en la base de datos
                $productoReal = Producto::where('codigo_barras', $prod['codigo_barras'])->first();
                // Validación crítica: Si un producto del XML no existe en tu tabla maestra, abortamos TODO
            if (!$productoReal) {
                DB::rollBack();
                return response()->json([
                    'error' => 'El producto con código de barras ' . $prod['codigo_barras'] . ' no existe en la base de datos.'
                ], 422);
            }

                $lotesParaInsertar[] = [
                    'id_producto' => $productoReal->id_producto,
                    'id_proveedor' => $proveedor->id_proveedor,
                    'id_sucursal' => $request->input('id_sucursal'),//venia directo el payload
                    'id_ingreso' => $ingreso->id_ingreso, // El ID que se acaba de crear arriba
                    'numero_lote' => $prod['numero_lote'],//si viene vacio, esta el retorno de SIN LOTE de la funcion previsualizar 
                    'fecha_caducidad' => $prod['fecha_caducidad'] ?? null,
                    'cantidad_disponible' => $prod['cantidad_ingreso'],
                    'costo_adquisicion' => $prod['precio_unitario'] * $prod['cantidad_ingreso'],
                    //precio de un producto por los cantidad_ingresio, nuevo campo hecho en el front
                    'fecha_ingreso' => now(),
                    
                ];
            }

            // 3. Inserción Masiva
            LotesInventario::insert($lotesParaInsertar);

            DB::commit(); 

            return response()->json([
                'status' => 'success',
                'message' => 'Ingreso registrado con éxito.'
            ], 201);

        } catch (\Exception $e) {
        DB::rollBack();
        return response()->json([
            'error' => 'Fallo BD: ' . $e->getMessage() . ' en la línea ' . $e->getLine()
        ], 500);
    }
    }
}