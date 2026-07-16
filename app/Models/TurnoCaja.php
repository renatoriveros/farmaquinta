<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class TurnoCaja extends Model
{
    protected $table = 'turnos_caja';
    protected $primaryKey = 'id_turno';
    
    // Desactivamos los timestamps automáticos ya que usas nombres personalizados en tu SQL
    public $timestamps = false;

    protected $fillable = [
        'id_usuario',
        'id_sucursal',
        'monto_apertura',
        'fecha_apertura',
        'monto_declarado_efectivo',
        'monto_declarado_tarjeta',
        'monto_cierre',
        'fecha_cierre',
        'estado'
    ];

    // Relación con el Usuario
    public function usuario()
    {
        return $this->belongsTo(User::class, 'id_usuario');
    }
}