<?php

namespace App\Http\Controllers;

use App\Models\Proveedor;
use Illuminate\Http\Request;
use Inertia\Inertia; // ¡No olvides agregar esta línea!

class ProveedorController extends Controller
{
    /**
     * Muestra el formulario para crear un nuevo proveedor.
     */
    public function create()
    {
        // Renderizamos tu componente de React
        return Inertia::render('Nuevo/Proveedor');
    }

    /**
     * Guarda el nuevo proveedor en la base de datos.
     */
    public function store(Request $request)
  {
    // Validar
    $validated = $request->validate([
        'identificacion_fiscal' => 'required|string|max:50|unique:proveedores,identificacion_fiscal',
        'nombre_empresa'        => 'required|string|max:150',
        'nombre_contacto'       => 'nullable|string|max:100',
        'telefono'              => 'nullable|string|max:20',
        'email'                 => 'nullable|email|max:100',
        'dias_credito'          => 'nullable|integer|min:0',
    ], [
        'identificacion_fiscal.required' => 'El RUT es obligatorio.',//con esto modifico los mensajes de error
        'identificacion_fiscal.unique'   => 'Este RUT ya está registrado.',
        'nombre_empresa.required'        => 'El nombre de la empresa es obligatorio.',
        'email.email'                    => 'Ingresa un correo electrónico válido.',
        'dias_credito.min'               => 'Los días de crédito no pueden ser negativos.',
    ]);

    // Asignar días de crédito por defecto, aunque en la db esta 0 por default
    $validated['dias_credito'] = $validated['dias_credito'] ?? 0;

    
    Proveedor::create($validated);

    
    return redirect()->route('nuevo.proveedor')
                     ->with('success', 'Proveedor creado exitosamente.');
  }
}