<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MovimientoCaja extends Model
{
    // Definimos el nombre exacto de la tabla
    protected $table = 'movimientos_caja';

    // Indicamos que la llave primaria es distinta a 'id'
    protected $primaryKey = 'id_movimiento';

    // Desactivamos los timestamps automáticos de Laravel (created_at/updated_at) 
    // porque tu tabla utiliza la columna personalizada 'fecha_hora'
    public $timestamps = false;

    // Campos permitidos para asignación masiva (Mass Assignment)
    protected $fillable = [
        'id_turno',
        'tipo_movimiento',
        'monto',
        'concepto',
        'fecha_hora',
    ];

    public function turno()
    {
        return $this->belongsTo(TurnoCaja::class, 'id_turno', 'id_turno');
    }
}