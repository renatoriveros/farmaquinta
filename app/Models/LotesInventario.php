<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class LotesInventario extends Model
{
    // 1. Nombre exacto de la tabla
    protected $table = 'lotes_inventario';

    // 2. Llave primaria
    protected $primaryKey = 'id_lote';

    // 3. Apagar timestamps si tu tabla no los tiene
    public $timestamps = false; 

    // 4. Campos permitidos para inyección masiva
    protected $fillable = [
        'id_producto',
        'id_proveedor',
        'id_sucursal',
        'id_ingreso',
        'numero_lote',
        'fecha_caducidad',
        'cantidad_disponible',
        'costo_adquisicion',
        'fecha_ingreso'
    ];

    // 5. RELACIÓN: Un lote "pertenece a" un producto
    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }
    // 6. RELACIÓN: Un lote "pertenece a" un proveedor
    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }
    
      //7. Relación: Un lote pertenece a un ingreso de mercadería (DTE/XML).
     
    public function ingresoMercaderia()
    {
        return $this->belongsTo(IngresoMercaderia::class, 'id_ingreso', 'id_ingreso');
    }
}