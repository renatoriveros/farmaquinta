import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import PosLayout from '@/Layouts/PosLayout';

export default function Dinero({ auth, turno_activo, desglose, saldo_disponible, error_turno }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        tipo_movimiento: 'egreso',
        monto: '',
        motivo: '',
        observaciones: ''
    });

    const [notificacion, setNotificacion] = useState(null);

    const mostrarNotificacion = (tipo, mensaje) => {
        setNotificacion({ tipo, mensaje });
        setTimeout(() => {
            setNotificacion(null);
        }, 4000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        const camposFaltantes = [];
        if (!data.tipo_movimiento) camposFaltantes.push('Tipo de Movimiento');
        if (!data.monto || isNaN(data.monto) || Number(data.monto) <= 0) camposFaltantes.push('Monto (debe ser mayor a 0)');
        if (!data.motivo) camposFaltantes.push('Motivo');

        if (camposFaltantes.length > 0) {
            mostrarNotificacion(
                'error', 
                `Faltan rellenar los siguientes campos: ${camposFaltantes.join(', ')}.`
            );
            return;
        }

        // Enviar al backend
        post(route('stock.dinero.store'), {
            onSuccess: () => {
                reset();
                mostrarNotificacion('exito', 'Movimiento registrado correctamente en la caja');
            },
            onError: (errores) => {
                const mensajeError = errores.error || 'Ocurrió un error al guardar. Verifica los datos.';
                mostrarNotificacion('error', mensajeError);
            }
        });
    };

    // Formatear moneda
    const formatoMoneda = (monto) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto || 0);
    };

    return (
        <PosLayout auth={auth} titulo="Movimientos de Dinero">
            <Head title="Movimientos de Dinero - Farmaquinta" />

            {/* NOTIFICACIÓN FLOTANTE */}
            {notificacion && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl font-bold transition-all duration-300 animate-fade-in-down flex items-center gap-3 ${
                    notificacion.tipo === 'error' 
                        ? 'bg-red-50 text-red-600 border-l-4 border-red-500' 
                        : notificacion.tipo === 'exito'
                            ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                            : 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500'
                }`}>
                    {notificacion.tipo === 'exito' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}
                    {notificacion.tipo === 'error' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    )}
                    <span>{notificacion.mensaje}</span>
                </div>
            )}

            <div className="flex-1 p-8 overflow-y-auto bg-gray-50 min-h-[calc(100vh-4rem)]">
                <div className="max-w-5xl mx-auto space-y-6">

                    {/* ALERTA SI NO HAY TURNO */}
                    {!turno_activo && (
                        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg shadow-sm">
                            <div className="flex items-center">
                                <svg className="h-8 w-8 text-red-500 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                                <div>
                                    <h3 className="text-lg font-bold text-red-800">Caja Cerrada</h3>
                                    <p className="text-red-700 mt-1">{error_turno}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* DESGLOSE DE CAJA (KPIs) */}
                    {turno_activo && (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-blue-500 p-4">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Apertura</p>
                                <p className="text-xl font-bold text-gray-800">{formatoMoneda(desglose.apertura)}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-green-500 p-4">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Ventas (Efectivo)</p>
                                <p className="text-xl font-bold text-green-600">+{formatoMoneda(desglose.ventas)}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-teal-500 p-4">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Ingresos Extra</p>
                                <p className="text-xl font-bold text-teal-600">+{formatoMoneda(desglose.ingresos)}</p>
                            </div>
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-red-500 p-4">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Egresos / Retiros</p>
                                <p className="text-xl font-bold text-red-600">-{formatoMoneda(desglose.egresos)}</p>
                            </div>
                            <div className="bg-[#1e40af] rounded-lg shadow-md border border-[#1e3a8a] p-4 text-black">
                                <p className="text-xs text-gray-500 font-bold uppercase mb-1">Saldo en Caja</p>
                                <p className="text-2xl font-extrabold">{formatoMoneda(saldo_disponible)}</p>
                            </div>
                        </div>
                    )}

                    {/* FORMULARIO */}
                    <div className={`bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden ${!turno_activo ? 'opacity-50 pointer-events-none' : ''}`}>
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                            
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-[#3b82f6] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                                    Detalles de la Operación
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                    
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
                                        <select
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm bg-white transition-colors"
                                            value={data.tipo_movimiento}
                                            onChange={(e) => setData('tipo_movimiento', e.target.value)}
                                            disabled={!turno_activo}
                                        >
                                            <option value="egreso">Retiro / Egreso (Resta Dinero)</option>
                                            <option value="ingreso">Ingreso Extra (Suma Dinero)</option>
                                        </select>
                                        {errors.tipo_movimiento && <span className="text-red-500 text-xs mt-1 block">{errors.tipo_movimiento}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Monto ($)</label>
                                        <input
                                            type="number"
                                            placeholder="Ej. 15000"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm transition-colors"
                                            value={data.monto}
                                            onChange={(e) => setData('monto', e.target.value)}
                                            disabled={!turno_activo}
                                            min="1"
                                        />
                                        {errors.monto && <span className="text-red-500 text-xs mt-1 block">{errors.monto}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo Corto</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Pago a proveedor"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm transition-colors"
                                            value={data.motivo}
                                            onChange={(e) => setData('motivo', e.target.value)}
                                            disabled={!turno_activo}
                                        />
                                        {errors.motivo && <span className="text-red-500 text-xs mt-1 block">{errors.motivo}</span>}
                                    </div>
                                </div>
                            </div>

                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-[#3b82f6] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                                    Observaciones (Opcional)
                                </h3>
                                <div className="bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                    <textarea
                                        rows="3"
                                        placeholder="Detalles adicionales del movimiento de caja..."
                                        className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm transition-colors"
                                        value={data.observaciones}
                                        onChange={(e) => setData('observaciones', e.target.value)}
                                        disabled={!turno_activo}
                                    ></textarea>
                                    {errors.observaciones && <span className="text-red-500 text-xs mt-1 block">{errors.observaciones}</span>}
                                </div>
                            </div>

                            <div className="flex justify-end pt-4 border-t border-gray-100">
                                <button
                                    type="submit"
                                    disabled={processing || !turno_activo}
                                    className="bg-[#3b82f6] text-white px-8 py-3 rounded-lg font-semibold hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all shadow-md disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                                >
                                    {processing ? 'Guardando...' : (
                                        <>
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
                                            </svg>
                                            Registrar Movimiento
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PosLayout>
    );
}