<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('ingresos_mercaderia', function (Blueprint $table) {
            // Usamos id_ingreso para mantener tu convención de nombres
            $table->id('id_ingreso'); 
            
            $table->integer('id_proveedor');
            $table->string('folio_documento', 50)->comment('Folio del DTE/Factura');
            $table->string('ruta_archivo_xml')->nullable()->comment('Ruta física del XML guardado');
            $table->enum('estado_cuadratura', ['Cuadrado', 'Con Diferencias', 'Pendiente'])->default('Pendiente');
            $table->date('fecha_ingreso');
            $table->timestamps();

            
            $table->foreign('id_proveedor')->references('id_proveedor')->on('proveedores')->onDelete('restrict');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('ingresos_mercaderia');
    }
};