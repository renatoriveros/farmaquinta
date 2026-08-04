import React, { useState, useMemo } from 'react';
import PosLayout from '@/Layouts/PosLayout';
import { Head } from '@inertiajs/react';
import TablaCierresCaja from '@/Components/Historial/Tabla_cierres_caja';

export default function CierresCaja({ auth, cierres }) {
    const [busqueda, setBusqueda] = useState('');
    const [filtroFecha, setFiltroFecha] = useState('');

    const cierresFiltrados = useMemo(() => {
        return cierres.filter((cierre) => {
            const coincideBusqueda = (cierre.usuario?.name || '').toLowerCase().includes(busqueda.toLowerCase());
            const coincideFecha = filtroFecha ? (cierre.fecha_apertura && cierre.fecha_apertura.startsWith(filtroFecha)) : true;
            return coincideBusqueda && coincideFecha;
        });
    }, [cierres, busqueda, filtroFecha]);

    return (
        <PosLayout auth={auth} titulo="Historial de Cierres de Caja">
            <Head title="Cierres de Caja" />
            
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full">
                {/* Cabecera con filtros */}
                <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6 shrink-0">
                    <div className="w-full xl:w-auto">
                        <h2 className="text-xl font-bold text-gray-800">Cierres de caja</h2>
                        
                    </div>
                    <div className="flex-1 w-full relative">
                        
                        <input
                            type="text"
                            placeholder="Busca un turno por usuario..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            className="w-full pl-5 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-colors text-sm"
                        />
                    </div>
                    
                    <div className="flex items-center gap-2">
                        <input
                            type="date"
                            value={filtroFecha}
                            onChange={(e) => setFiltroFecha(e.target.value)}
                            className="border border-gray-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-[#0f3b8e] focus:border-[#0f3b8e]"
                        />
                        {filtroFecha && (
                            <button
                                onClick={() => setFiltroFecha('')}
                                className="p-3 text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                                title="Limpiar fecha"
                            >
                                ✖
                            </button>
                        )}
                    </div>
                </div>

                <div className="flex-1 overflow-hidden flex flex-col">
                    <TablaCierresCaja cierres={cierresFiltrados} />
                </div>
            </div>
        </PosLayout>
    );
}
