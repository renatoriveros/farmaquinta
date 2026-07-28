<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
   public function up()
{
    Schema::table('ventas', function (Blueprint $table) {
        // Los agregamos como decimales para que coincidan con tu total_venta (ej: 8980.00)
        // Los ponemos 'nullable' porque si pagan con Tarjeta/Transferencia, el vuelto no aplica
        $table->decimal('pago_recibido', 10, 2)->nullable()->after('total_venta');
        $table->decimal('vuelto', 10, 2)->nullable()->after('pago_recibido');
    });
}

public function down()
{
    Schema::table('ventas', function (Blueprint $table) {
        $table->dropColumn(['pago_recibido', 'vuelto']);
    });
}
};
