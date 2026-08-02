<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class MovimientoMercaderia extends Model
{
    use HasFactory;

    protected $table = 'movimientos_mercaderia';
    protected $primaryKey = 'id_movimiento';
    public $timestamps = false; 
    protected $fillable = [
        'id_producto',
        'numero_lote',
        'tipo_movimiento',
        'motivo',
        'cantidad',
        'observaciones',
        'id_usuario',
        'fecha_hora'
    ];

    public function producto()
    {
        return $this->belongsTo(Producto::class, 'id_producto', 'id_producto');
    }

    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario', 'id'); // usually Users table PK is 'id'
    }
}