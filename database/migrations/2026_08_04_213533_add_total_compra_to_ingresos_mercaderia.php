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
        Schema::table('ingresos_mercaderia', function (Blueprint $table) {
            $table->decimal('total_compra', 12, 2)->default(0)->after('estado_cuadratura');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('ingresos_mercaderia', function (Blueprint $table) {
            $table->dropColumn('total_compra');
        });
    }
};
