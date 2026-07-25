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
            // 2. SUMAR STOCK: Crea una nueva columna "lotes_sum_cantidad_disponible" al vuelo
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
        // Seleccionamos 'id_categoria as id' para que coincida exactamente
        // con el 'cat.id' que usamos en el .map() de React.
        $categorias = Categoria::where('activo', 1)
            ->get(['id_categoria', 'nombre']);

        // 2. Retornamos la vista de React y le pasamos las categorías
        return Inertia::render('Nuevo/Producto', [
            'categorias' => $categorias
        ]);
    }
    public function NuevoRemedio(Request $request)
{
    // 1. Validamos todos los campos que llegan del formulario
    $validated = $request->validate([
        'id_categoria'     => 'required|exists:categorias,id_categoria',
        'codigo_barras'    => 'required|string|max:255|unique:productos,codigo_barras',
        'nombre_comercial' => 'required|string|max:255',
        'principio_activo' => 'nullable|string|max:255',
        'laboratorio'      => 'nullable|string|max:255',
        'concentracion'    => 'nullable|string|max:100',
        'presentacion'     => 'nullable|string|max:255',
        'requiere_receta'  => 'required|boolean',
        'precio_venta'     => 'required|numeric|min:0',
        'stock_minimo'     => 'required|integer|min:0',
        
    ]);

    // 2 activo por defecto (siempre que se crea un producto activo)
    $validated['activo'] = 1;

    // 3. Guardamos en la base de datos
    Producto::create($validated);

    // 4. Redirigimos con un mensaje de éxito (opcional)
    return redirect()->route('nuevo.producto')
                     ->with('success', 'Producto creado correctamente');
}
    // Un Producto PERTENECE A una Categoría
    public function categoria()
    {
        // Parámetros: Modelo Destino, Llave foránea en esta tabla, Llave primaria en la otra tabla
        return $this->belongsTo(Categoria::class, 'id_categoria', 'id_categoria');
    }


}