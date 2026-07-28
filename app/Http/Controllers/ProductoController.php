<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Producto;
use App\Models\Categoria;
use Inertia\Inertia;

class ProductoController extends Controller
{
    public function buscarPuntoVenta(Request $request)
    {
        $termino = $request->query('q');

        if (!$termino) {
            return response()->json([]);
        }

        
        $productos = Producto::where('activo', true)
            // 1.  Solo productos que tengan lotes con cantidad > 0 y no vencidos
            ->whereHas('lotes', function ($query) {
                $query->where('cantidad_disponible', '>', 0)
                      ->where('fecha_caducidad', '>=', now());
            })
            // 2. SUMAR STOCK: Crea una nueva columna "lotes_sum_cantidad_disponible"
            ->withSum(['lotes' => function ($query) {
                $query->where('cantidad_disponible', '>', 0)
                      ->where('fecha_caducidad', '>=', now());
            }], 'cantidad_disponible')
            // 3. FILTRAR POR TEXTO (Código, Nombre o Principio Activo)
            ->where(function ($query) use ($termino) {
                $query->where('codigo_barras', $termino)
                      ->orWhere('nombre_comercial', 'LIKE', "%{$termino}%")
                      ->orWhere('principio_activo', 'LIKE', "%{$termino}%");
            })
            ->take(15) // Tu límite de 15 resultados
            ->get();

        return response()->json($productos);
    }
    public function create()//mostrar en blanco para crear algo
    {
        // 1. Buscamos todas las categorías que estén activas
        $categorias = Categoria::where('activo', 1)
            ->get(['id_categoria', 'nombre']);

        // 2. Retornamos la vista de React y le pasamos las categorías
        return Inertia::render('Nuevo/Producto', [
            'categorias' => $categorias
        ]);
    }
   public function gestionar(Request $request)//busqueda predictiva activar producto
    {
        // inicio consulta
        $query = Producto::query();

        // Si el usuario escribió algo en el buscador, filtramos
        if ($request->has('buscar') && $request->buscar != null) {
            $termino = $request->buscar;
            
            $query->where('nombre_comercial', 'LIKE', '%' . $termino . '%')
                  ->orWhere('codigo_barras', 'LIKE', '%' . $termino . '%');
        }

        //  Obtenemos los resultados (limitamos a 9)
        
        $productos = $query->select('id_producto','codigo_barras', 'nombre_comercial','activo')
                           ->take(9)
                           ->get();

        //  Retornamos la vista pasando los productos reales
        return Inertia::render('Nuevo/ActivarProducto', [
            'productos' => $productos,
            'filtroActual' => $request->buscar // Devolvemos el texto para que el input no se borre
        ]);
    }

    public function toggleActivo($id_producto)
    {
        // 1. Buscamos el producto por su ID (si no existe, Laravel devuelve 404)
        $producto = Producto::findOrFail($id_producto);
        // Si estaba en 1 pasa a 0 y viceversa
        $producto->activo = !$producto->activo; 
        $producto->save();
        // Inertia recargará los datos automáticamente por detrás.
        return back(); 
    }

     public function NuevoRemedio(Request $request)
        {
        // 1. Validamos todos los campos que llegan del formulario
        // con mensajes de error personalizados
        $validated = $request->validate([
            'id_categoria'     => 'required|exists:categorias,id_categoria',
            'codigo_barras'    => 'required|string|max:255|unique:productos,codigo_barras',
            'nombre_comercial' => 'required|string|max:255',
            'principio_activo' => 'nullable|string|max:255',
            'laboratorio'      => 'nullable|string|max:255',
            'concentracion'    => 'nullable|string|max:100',
            'presentacion'     => 'nullable|string|max:255',
            'requiere_receta' => 'required|boolean|accepted_if:receta_retenida,true,1',
            'precio_venta'     => 'required|numeric|min:0',
            'stock_minimo'     => 'required|integer|min:0',
            'receta_retenida'  => 'required|boolean',
        ], [
            //  Mensajes personalizados para los errores
            'id_categoria.required'     => 'La categoría es obligatoria.',
            'id_categoria.exists'       => 'La categoría seleccionada no es válida.',
            'codigo_barras.required'    => 'El código de barras es obligatorio.',
            'codigo_barras.unique'      => 'Este código de barras ya está registrado en el sistema.',
            'codigo_barras.max'         => 'El código de barras no puede tener más de 255 caracteres.',
            'nombre_comercial.required' => 'El nombre comercial del producto es obligatorio.',
            'nombre_comercial.max'      => 'El nombre comercial no puede tener más de 255 caracteres.',
            'principio_activo.max'      => 'El principio activo no puede tener más de 255 caracteres.',
            'laboratorio.max'           => 'El laboratorio no puede tener más de 255 caracteres.',
            'concentracion.max'         => 'La concentración no puede tener más de 100 caracteres.',
            'presentacion.max'          => 'La presentación no puede tener más de 255 caracteres.',
            'requiere_receta.required'  => 'El campo requiere receta es obligatorio.',
            'requiere_receta.boolean'   => 'El valor de "requiere receta" debe ser si o no.',
           'requiere_receta.accepted_if'=> 'El producto debe requerir receta obligatoriamente si es de receta retenida.',
            'precio_venta.required'     => 'El precio de venta es obligatorio.',
            'precio_venta.numeric'      => 'El precio de venta debe ser un número válido.',
            'precio_venta.min'          => 'El precio de venta no puede ser negativo.',
            'stock_minimo.required'     => 'El stock mínimo es obligatorio.',
            'stock_minimo.integer'      => 'El stock mínimo debe ser un número entero.',
            'stock_minimo.min'          => 'El stock mínimo no puede ser negativo.',
            'receta_retenida.boolean'   => 'El valor de "requiere receta retenida" debe ser si o no.',
        ]);

        // Asignamos activo = 1 por defecto
        $validated['activo'] = 1;
        Producto::create($validated);
        return redirect()->route('nuevo.producto')->with('success', true);
    }
    // Un Producto PERTENECE A una Categoría
    public function categoria()
    {
        // Parámetros: Modelo Destino, Llave foránea en esta tabla, Llave primaria en la otra tabla
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id_categoria');
    }


}