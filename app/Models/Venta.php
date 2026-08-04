<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Venta extends Model
{
    protected $table = 'ventas';
    protected $primaryKey = 'id_venta';
    public $timestamps = false; 

    protected $fillable = [
        'id_sucursal',
        'id_turno',
        'id_usuario',
        'fecha_hora',
        'metodo_pago',
        'folio_receta',
        'total_venta',
        'pago_recibido',
        'vuelto'
    ];

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }

    public function detalles()
    {
        return $this->hasMany(DetalleVenta::class, 'id_venta');
    }
}