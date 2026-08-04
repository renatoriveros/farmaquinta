import React from 'react';
import { useForm } from '@inertiajs/react';

export default function ModalCerrarTurno({ isVisible, onClose }) {
    const { data: dataCierre, setData: setDataCierre, post: postCierre, processing: processingCierre, errors: errorsCierre } = useForm({
        monto_declarado_efectivo: '',
        monto_declarado_tarjeta: '',
    });

    if (!isVisible) return null;

    const handleCerrarTurno = (e) => {
        e.preventDefault();
        postCierre(route('turno.cerrar'), {
            onSuccess: () => onClose(),
        });
    };

    return (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                {/* Cabecera del Modal */}
                <div className="bg-orange-500 text-white p-6 text-center flex flex-col items-center">
                    <h3 className="text-xl font-bold">Cierre de Caja</h3>
                    <p className="text-orange-100 text-xs mt-1">Declare los montos finales contados en caja</p>
                </div>

                {/* Formulario */}
                <form onSubmit={handleCerrarTurno} className="p-6">
                    <div className="mb-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Efectivo en Caja</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-bold">$</span>
                            </div>
                            <input 
                                type="number" 
                                required
                                min="0"
                                placeholder="0"
                                value={dataCierre.monto_declarado_efectivo}
                                onChange={(e) => setDataCierre('monto_declarado_efectivo', e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-bold text-gray-800 bg-gray-50"
                            />
                        </div>
                        {errorsCierre.monto_declarado_efectivo && <p className="text-red-500 text-xs mt-1 font-semibold">{errorsCierre.monto_declarado_efectivo}</p>}
                    </div>

                    <div className="mb-6">
                        <label className="block text-sm font-bold text-gray-700 mb-2">Total Vouchers (Tarjetas)</label>
                        <div className="relative">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <span className="text-gray-500 font-bold">$</span>
                            </div>
                            <input 
                                type="number" 
                                required
                                min="0"
                                placeholder="0"
                                value={dataCierre.monto_declarado_tarjeta}
                                onChange={(e) => setDataCierre('monto_declarado_tarjeta', e.target.value)}
                                className="w-full pl-8 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 transition-colors font-bold text-gray-800 bg-gray-50"
                            />
                        </div>
                        {errorsCierre.monto_declarado_tarjeta && <p className="text-red-500 text-xs mt-1 font-semibold">{errorsCierre.monto_declarado_tarjeta}</p>}
                    </div>

                    {/* Botones de acción */}
                    <div className="space-y-2 mt-6">
                        <button 
                            type="submit"
                            disabled={processingCierre}
                            className="w-full bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center shadow"
                        >
                            Cerrar Caja Definitivamente
                        </button>

                        <button 
                            type="button"
                            onClick={onClose}
                            className="w-full text-center text-sm text-gray-600 hover:text-gray-800 font-semibold py-2 transition-colors"
                        >
                            Cancelar
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
