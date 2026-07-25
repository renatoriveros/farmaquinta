<?php

namespace App\Http\Controllers;

use App\Models\Categoria;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CategoriaController extends Controller
{
    /**
     * Muestra la lista de todas las categorías.
     */
    public function index()//es como el getAll
    {
        // Traemos todas las categorías de la base de datos
        $categorias = Categoria::all();

        // Renderizamos una vista de React (que crearemos luego) y le pasamos los datos
        return Inertia::render('Categorias/Index', [
            'categorias' => $categorias
        ]);
    }

    /**
     * Guarda una nueva categoría en la base de datos.
     */
    public function store(Request $request)//insert basico
    {
        // 1. Validamos que los datos que vienen de React sean correctos
        $request->validate([
            'nombre' => 'required|string|max:255',
            'descripcion' => 'nullable|string',
            
        ]);

        
        Categoria::create([
            'nombre' => $request->nombre,
            'descripcion' => $request->descripcion,
            'activo' => 1 
        ]);

        // Redirigimos de vuelta a la lista con un mensaje de éxito
        // (Inertia intercepta esto y actualiza la página sin recargar)
        return redirect()->back();
    }
}