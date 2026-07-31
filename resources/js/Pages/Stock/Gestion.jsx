import React, { useState } from 'react';
import { Head, Link } from '@inertiajs/react';
import TablaLotes from '@/Components/Gestion_lotes/TablaLotes';
import PosLayout from '@/Layouts/PosLayout';

// Agregamos 'kpis' y 'lotes' a los props que recibe la función
export default function Gestion({ auth, kpis, lotes }) {
    const [filtro, setFiltro] = useState('todos');

    const lotesFiltrados = lotes.filter(lote => {
        if (filtro === 'todos') return true;
        return lote.estado === filtro;
    });

    return (
        <PosLayout auth={auth} titulo="Gestión de Lotes">
            <Head title="Gestión de Lotes - Farmaquinta" />

            <div className="p-6 bg-gray-50 min-h-screen">
                
                {/* 1. SECCIÓN DE KPIs Dinámicos */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                    
                    <div 
                        onClick={() => setFiltro('todos')}
                        className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${filtro === 'todos' ? 'ring-2 ring-blue-500 border-l-4 border-l-blue-600' : 'border-gray-200 border-l-4 border-l-blue-600 hover:bg-blue-50'}`}
                    >
                        <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">Total Lotes Activos</p>
                        <p className="text-3xl font-extrabold text-blue-900">{kpis.total}</p>
                    </div>

                    <div 
                        onClick={() => setFiltro('critico')}
                        className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${filtro === 'critico' ? 'ring-2 ring-red-500 border-l-4 border-l-red-600' : 'border-gray-200 border-l-4 border-l-red-600 hover:bg-red-50'}`}
                    >
                        <p className="text-xs text-red-600 font-bold uppercase tracking-wider mb-1">Vencidos</p>
                        <p className="text-3xl font-extrabold text-red-700">{kpis.criticos}</p>
                    </div>

                    <div 
                        onClick={() => setFiltro('advertencia')}
                        className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${filtro === 'advertencia' ? 'ring-2 ring-orange-500 border-l-4 border-l-orange-500' : 'border-gray-200 border-l-4 border-l-orange-500 hover:bg-orange-50'}`}
                    >
                        <p className="text-xs text-orange-600 font-bold uppercase tracking-wider mb-1">Alerta 3-6 Meses</p>
                        <p className="text-3xl font-extrabold text-orange-700">{kpis.advertencia}</p>
                    </div>

                    <div 
                        onClick={() => setFiltro('sano')}
                        className={`bg-white rounded-lg shadow-sm border p-4 cursor-pointer transition-all ${filtro === 'sano' ? 'ring-2 ring-green-500 border-l-4 border-l-green-500' : 'border-gray-200 border-l-4 border-l-green-500 hover:bg-green-50'}`}
                    >
                        <p className="text-xs text-green-600 font-bold uppercase tracking-wider mb-1">Stock Sano</p>
                        <p className="text-3xl font-extrabold text-green-700">{kpis.sanos}</p>
                    </div>

                </div>

                {/* 2. TABLA FEFO */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    
                    <TablaLotes lotes={lotesFiltrados} />
                </div>

            </div>
        </PosLayout>
    );
}