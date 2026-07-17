<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Producto extends Model
{
    // 1. Le decimos a Laravel cómo se llama exactamente tu tabla en SQL
    protected $table = 'productos';
    
    // 2. Le decimos que tu llave primaria no se llama "id" (como espera Laravel), sino "id_producto"
    protected $primaryKey = 'id_producto';
    
    // 3. Apagamos los timestamps porque tu tabla no tiene las columnas created_at ni updated_at
    public $timestamps = false; 

    // 4. (Opcional pero recomendado) Protegemos qué campos se pueden llenar masivamente
    protected $fillable = [
        'id_categoria',
        'codigo_barras',
        'nombre_comercial',
        'principio_activo',
        'concentracion',
        'presentacion',
        'requiere_receta',
        'precio_venta',
        'stock_minimo',
        'activo'
    ];
}