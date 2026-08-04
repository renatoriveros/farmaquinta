import React from 'react';
import { Link, useForm } from '@inertiajs/react';

export default function ModalAbrirTurno({ isVisible, auth }) {
    const { data, setData, post, processing, errors } = useForm({
        monto_apertura: '',
    });

    if (!isVisible) return null;

    const handleAbrirTurno = (e) => {
        e.preventDefault();
        post(route('turno.abrir'));
    };

    return (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Cabecera del Modal */}
                <div className="bg-[#0f3b8e] text-white p-6 text-center flex flex-col items-center">
                    <h3 className="text-xl font-bold">Apertura de Turno</h3>
                    <p className="text-blue-200 text-xs mt-1">Declare su saldo inicial para habilitar las ventas</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleAbrirTurno} className="p-6">
                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Declarar Efectivo de Apertura</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-bold">$</span>
                            </div>
                            <input 
                                type="number" 
                                required
                                min="0"
                                placeholder="0"
                                value={data.monto_apertura}
                                onChange={(e) => setData('monto_apertura', e.target.value)}
                                className="w-full pl-8 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-colors text-lg font-bold text-gray-800 bg-gray-50"
                            />
                        </div>
                        {errors.monto_apertura && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.monto_apertura}</p>}
                        
                        {/* Montos Rápidos */}
                        <div className="flex gap-2 mt-3">
                            {['50000', '100000', '150000'].map((monto) => (
                                <button 
                                    key={monto}
                                    type="button"
                                    onClick={() => setData('monto_apertura', monto)}
                                    className="flex-1 py-1 px-2 border border-gray-200 hover:border-[#0f3b8e] hover:bg-blue-50 text-xs rounded font-semibold text-gray-600 hover:text-[#0f3b8e] transition-colors"
                                >
                                    ${parseInt(monto).toLocaleString('es-CL')}
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                        <div>
                            <p className="text-xs text-gray-500 font-medium">Usuario actual</p>
                            <p className="text-sm font-bold text-gray-800">{auth.user.name}</p>
                        </div>
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-2 mt-6">
                        <button 
                            type="submit"
                            disabled={processing}
                            className="w-full bg-[#0f3b8e] hover:bg-[#0a2966] text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 shadow"
                        >
                            Confirmar y Abrir Turno <span>➜</span>
                        </button>

                        <Link 
                            href={route('logout')} 
                            method="post" 
                            as="button" 
                            className="w-full text-center text-sm text-red-600 hover:text-red-800 font-semibold py-2 transition-colors"
                        >
                            Cancelar y Salir
                        </Link>
                    </div>
                </form>
            </div>
        </div>
    );
}
