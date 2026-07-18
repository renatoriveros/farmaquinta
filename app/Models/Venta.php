<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $table = 'ventas';
    protected $primaryKey = 'id_venta';
    public $timestamps = false; // Lo apagamos porque usas tu propio campo 'fecha_hora'

    protected $fillable = [
        'id_sucursal',
        'id_turno',
        'id_usuario',
        'fecha_hora',
        'metodo_pago',
        'folio_receta',
        'total_venta'
    ];
}