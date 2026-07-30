<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class CatalogoProveedor extends Model
{
    use HasFactory;

    // 1. Apuntamos a tu tabla exacta (Laravel por defecto buscaría 'catalogo_proveedors')
    protected $table = 'catalogos_proveedores';

    // 2. Permitimos la asignación masiva para los campos que vienen del Excel
    protected $fillable = [
        'id_proveedor',
        'codigo_barras',
        'nombre_producto_proveedor',
        'precio_costo',
    ];
    
}