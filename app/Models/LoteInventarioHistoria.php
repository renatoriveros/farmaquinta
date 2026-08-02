<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class LoteInventarioHistoria extends Model
{
    use HasFactory;

    protected $table = 'lotes_inventario_historia';
    protected $primaryKey = 'id_lote'; // or whatever the primary key is

    // The timestamp columns might not exist or might be standard.
    public $timestamps = false; // Assuming no updated_at/created_at if it's a history table, or we can leave it default. 

    protected $fillable = [
        'id_producto',
        'id_proveedor',
        'id_sucursal',
        'id_ingreso',
        'numero_lote',
        'fecha_caducidad',
        'cantidad_disponible',
        'costo_adquisicion',
        'fecha_ingreso',
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }

    public function ingreso()
    {
        return $this->belongsTo(IngresoMercaderia::class, 'id_ingreso', 'id_ingreso');
    }
}
