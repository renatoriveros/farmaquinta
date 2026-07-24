<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('lotes_inventario', function (Blueprint $table) {
            // Agregamos la columna id_ingreso (nullable por si hay lotes antiguos que no tienen ingreso asociado)
            $table->unsignedBigInteger('id_ingreso')->nullable()->after('id_sucursal');

            // Creamos la llave foránea que conecta ambas tablas
            $table->foreign('id_ingreso')
                  ->references('id_ingreso')
                  ->on('ingresos_mercaderia')
                  ->onDelete('set null'); // Si borras el registro del ingreso, no borras el lote físico, solo desenlazas
        });
    }

    public function down(): void
    {
        Schema::table('lotes_inventario', function (Blueprint $table) {
            $table->dropForeign(['id_ingreso']);
            $table->dropColumn('id_ingreso');
        });
    }
};