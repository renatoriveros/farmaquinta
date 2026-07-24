<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class IngresoMercaderia extends Model
{
    use HasFactory;

    // Especificamos la tabla si no sigue la convención plural exacta
    protected $table = 'ingresos_mercaderia';

    // Especificamos la llave primaria personalizada
    protected $primaryKey = 'id_ingreso';

    // Campos que se pueden llenar masivamente
    protected $fillable = [
        'id_proveedor',
        'folio_documento',
        'ruta_archivo_xml',
        'estado_cuadratura',
        'fecha_ingreso',
    ];

    /**
     * Relación: Un ingreso pertenece a un proveedor.
     */
    public function proveedor()
    {
        return $this->belongsTo(Proveedor::class, 'id_proveedor', 'id_proveedor');
    }

    /**
     * Relación: Un ingreso tiene muchos lotes de inventario asociados.
     */
    public function lotes()
    {
        return $this->hasMany(LoteInventario::class, 'id_ingreso', 'id_ingreso');
    }
}