<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Proveedor extends Model
{
    // 1. Nombre exacto de la tabla
    protected $table = 'proveedores';

    // 2. Llave primaria
    protected $primaryKey = 'id_proveedor';

    // 3. Apagar timestamps si tu tabla no tiene created_at / updated_at
    public $timestamps = false; 

    // 4. Campos permitidos para inyección masiva
    protected $fillable = [
        'identificacion_fiscal',
        'nombre_empresa',
        'nombre_contacto',
        'telefono',
        'email',
        'dias_credito'
    ];

    // 5. RELACIÓN: Un proveedor "tiene muchos" lotes
    public function lotes()
    {
        return $this->hasMany(LotesInventario::class, 'id_proveedor', 'id_proveedor');
    }
}