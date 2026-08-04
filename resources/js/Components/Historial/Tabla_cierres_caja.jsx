import React, { useState } from 'react';

export default function TablaCierresCaja({ cierres }) {
    const [visibleCount, setVisibleCount] = useState(10);

    const handleLoadMore = () => {
        setVisibleCount((prev) => prev + 10);
    };

    const cierresPaginados = cierres.slice(0, visibleCount);

    if (cierres.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center h-full">
                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                    <span className="text-4xl">📭</span>
                </div>
                <h3 className="text-lg font-bold text-gray-700">No hay cierres registrados</h3>
                <p className="text-gray-400 text-sm mt-1">No se encontraron cierres de caja con los filtros actuales.</p>
            </div>
        );
    }

    return (
        <div className="flex-1 flex flex-col h-full relative">
            <div className="flex-1 overflow-auto rounded-xl border border-gray-100 bg-white">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 border-b border-gray-100">
                            <th className="w-[15%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario</th>
                            <th className="w-[15%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Apertura</th>
                            <th className="w-[15%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Cierre</th>
                            
                            <th className="w-[20%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Efectivo Decl. vs Teo.</th>
                            <th className="w-[15%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-right">Tarjetas Decl.</th>
                            <th className="w-[10%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Estado</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {cierresPaginados.map((cierre) => {
                            const diferencia = (Number(cierre.monto_declarado_efectivo) || 0) - (Number(cierre.monto_cierre) || 0);
                            const diferenciaClase = cierre.estado === 'Cerrado' 
                                ? (diferencia >= 0 ? 'text-emerald-600' : 'text-rose-600')
                                : 'text-gray-500';

                            return (
                                <tr key={cierre.id_turno} className="hover:bg-blue-50/30 transition-colors group border-b border-gray-50">

                                    <td className="py-4 px-6">
                                        <span className="text-sm font-semibold text-gray-700">{cierre.usuario?.name || 'Desconocido'}</span>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {cierre.fecha_apertura ? new Date(cierre.fecha_apertura.replace(' ', 'T')).toLocaleDateString('es-CL') : '--'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {cierre.fecha_apertura ? new Date(cierre.fecha_apertura.replace(' ', 'T')).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '--'}
                                        </p>
                                    </td>
                                    <td className="py-4 px-6">
                                        <p className="text-sm font-semibold text-gray-800">
                                            {cierre.fecha_cierre ? new Date(cierre.fecha_cierre.replace(' ', 'T')).toLocaleDateString('es-CL') : '--'}
                                        </p>
                                        <p className="text-xs text-gray-500">
                                            {cierre.fecha_cierre ? new Date(cierre.fecha_cierre.replace(' ', 'T')).toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }) : '--'}
                                        </p>
                                    </td>
                                    
                                    <td className="py-4 px-6 text-right">
                                        {cierre.estado === 'Cerrado' ? (
                                            <>
                                                <p className="text-sm font-bold text-gray-900">
                                                    Decl: ${Number(cierre.monto_declarado_efectivo).toLocaleString('es-CL')}
                                                </p>
                                                <p className={`text-xs font-bold ${diferenciaClase}`}>
                                                    Teo: ${Number(cierre.monto_cierre).toLocaleString('es-CL')}
                                                </p>
                                            </>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-400">En curso</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-right">
                                        {cierre.estado === 'Cerrado' ? (
                                            <p className="text-sm font-bold text-gray-900">
                                                ${Number(cierre.monto_declarado_tarjeta).toLocaleString('es-CL')}
                                            </p>
                                        ) : (
                                            <span className="text-sm font-medium text-gray-400">En curso</span>
                                        )}
                                    </td>
                                    <td className="py-4 px-6 text-center">
                                        <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                                            cierre.estado === 'Cerrado' 
                                                ? 'bg-emerald-100 text-emerald-700 border border-emerald-200' 
                                                : 'bg-amber-100 text-amber-700 border border-amber-200 animate-pulse'
                                        }`}>
                                            {cierre.estado}
                                        </span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {cierres.length > visibleCount && (
                <div className="flex justify-center p-4 border-t border-gray-100 bg-white shrink-0">
                    <button
                        onClick={handleLoadMore}
                        className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-bold rounded-lg hover:bg-gray-50 hover:text-[#0f3b8e] hover:border-[#0f3b8e] transition-colors text-sm shadow-sm"
                    >
                        Ver más cierres ↓
                    </button>
                </div>
            )}
        </div>
    );
}
