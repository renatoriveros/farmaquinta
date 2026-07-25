<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Categoria extends Model
{
    use HasFactory;

    // 1. Le decimos exactamente cómo se llama la tabla (opcional pero buena práctica)
    protected $table = 'categorias';

    // 2.Le decimos que tu llave primaria personalizada es 'id_categoria'
    protected $primaryKey = 'id_categoria';

    // 3. Los campos que permitimos que se llenen masivamente (ej. desde un formulario de React)
    protected $fillable = [
        'nombre',
        'descripcion',
        'activo'
    ];

    public function productos()
    {
        return $this->hasMany(Producto::class, 'id_categoria', 'id_categoria');
    }
}