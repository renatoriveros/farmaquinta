<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ProveedorB2BCredencial extends Model
{
    use HasFactory;

    protected $table = 'proveedores_b2b_credenciales';
    protected $primaryKey = 'id_credencial';

    protected $fillable = [
        'codigo_proveedor',
        'url_login',
        'usuario',
        'password',
        'token_api',
        'cookies_sesion',
        'es_cliente_normal',
        'activo',
    ];

    protected $casts = [
        'usuario' => 'encrypted',
        'password' => 'encrypted',
        'token_api' => 'encrypted',
        'cookies_sesion' => 'encrypted',
        'es_cliente_normal' => 'boolean',
        'activo' => 'boolean',
    ];
}
