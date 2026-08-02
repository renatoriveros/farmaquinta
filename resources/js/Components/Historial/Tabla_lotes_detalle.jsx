import React from 'react';

export default function TablaLotesDetalle({ isOpen, onClose, ingreso }) {
    if (!isOpen || !ingreso) return null;

    const lotes = ingreso.lotes_historia || [];

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Overlay oscuro */}
            <div 
                className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" 
                onClick={onClose}
            ></div>
            
            {/* Contenido del Modal */}
            <div className="bg-white rounded-2xl shadow-2xl z-10 w-full max-w-4xl max-h-[85vh] flex flex-col overflow-hidden m-4 transform transition-all">
                {/* Cabecera del Modal */}
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-100 flex items-center justify-between">
                    <div>
                        <h3 className="text-lg font-bold text-gray-800">
                            Lotes Ingresados - Factura #{ingreso.folio_documento}
                        </h3>
                        <p className="text-sm text-gray-500">
                            Proveedor: <span className="font-semibold text-gray-700">{ingreso.proveedor?.nombre_empresa || 'Desconocido'}</span>
                        </p>
                    </div>
                    <button 
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 bg-white hover:bg-gray-100 p-2 rounded-lg transition-colors border border-gray-200"
                    >
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                        </svg>
                    </button>
                </div>
                
                {/* Cuerpo del Modal: La Tabla de Lotes */}
                <div className="p-6 overflow-y-auto">
                    {lotes.length === 0 ? (
                        <div className="text-center py-8 text-gray-500">
                            No hay lotes registrados para este ingreso.
                        </div>
                    ) : (
                        <div className="overflow-x-auto bg-white rounded-xl border border-gray-100 shadow-sm">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50/80 border-b border-gray-100">
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Lote</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Cant.</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider">Vencimiento</th>
                                        <th className="py-3 px-4 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Costo Adq.</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {lotes.map((lote) => (
                                        <tr key={lote.id_lote} className="hover:bg-blue-50/30 transition-colors">
                                            <td className="py-3 px-4">
                                                <div className="font-bold text-gray-800 text-sm">
                                                    {lote.producto?.nombre_comercial || 'Producto Desconocido'}
                                                </div>
                                                <div className="text-xs text-gray-400">
                                                    Cód: {lote.producto?.codigo_barras || 'N/A'}
                                                </div>
                                            </td>
                                            <td className="py-3 px-4">
                                                <span className={`px-2 py-1 text-xs font-semibold rounded-md ${lote.numero_lote === 'SIN LOTE' ? 'bg-gray-100 text-gray-600' : 'bg-indigo-50 text-indigo-700 border border-indigo-100'}`}>
                                                    {lote.numero_lote}
                                                </span>
                                            </td>
                                            <td className="py-3 px-4 text-center">
                                                <span className="font-bold text-gray-700 text-sm">{lote.cantidad_disponible}</span>
                                            </td>
                                            <td className="py-3 px-4">
                                                {lote.fecha_caducidad ? (
                                                    <div className="text-sm text-gray-700 flex items-center gap-1.5">
                                                        <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path></svg>
                                                        {new Date(lote.fecha_caducidad).toLocaleDateString('es-CL')}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400 italic">Sin Venc.</span>
                                                )}
                                            </td>
                                            <td className="py-3 px-4 text-right">
                                                <div className="text-sm font-semibold text-emerald-600">
                                                    ${Number(lote.costo_adquisicion || 0).toLocaleString('es-CL')}
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
                
                {/* Pie del Modal */}
                <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 flex justify-end">
                    <button 
                        onClick={onClose}
                        className="bg-gray-800 hover:bg-gray-700 text-white font-medium py-2 px-6 rounded-lg transition-colors shadow-sm"
                    >
                        Cerrar
                    </button>
                </div>
            </div>
        </div>
    );
}
