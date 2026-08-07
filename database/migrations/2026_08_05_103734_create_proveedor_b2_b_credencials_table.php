<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('proveedores_b2b_credenciales', function (Blueprint $table) {
            $table->id('id_credencial');
            $table->string('codigo_proveedor')->unique()->comment('ej: mediven, provefarma, etc.');
            $table->text('url_login')->nullable();
            $table->text('usuario')->nullable()->comment('Cifrado');
            $table->text('password')->nullable()->comment('Cifrado');
            $table->text('token_api')->nullable()->comment('Cifrado, se usa para ID Sucursal o JWT');
            $table->text('cookies_sesion')->nullable()->comment('Cifrado, guarda la sesión de scraping');
            $table->boolean('es_cliente_normal')->default(false)->comment('Para logins que piden marcar soy cliente');
            $table->boolean('activo')->default(true);
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('proveedores_b2b_credenciales');
    }
};
