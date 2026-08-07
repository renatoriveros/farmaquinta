import React, { useState } from 'react';
import { router } from '@inertiajs/react';

export default function FiltrosDashboard({ rutaBase, rangoActual, desdeActual = '', hastaActual = '' }) {
    const [fechas, setFechas] = useState({
        desde: desdeActual || '',
        hasta: hastaActual || ''
    });

    const handleRangoChange = (nuevoRango) => {
        router.get(route(rutaBase), { rango: nuevoRango }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const handleBusquedaPersonalizada = () => {
        if (!fechas.desde || !fechas.hasta) {
            alert('Por favor selecciona ambas fechas');
            return;
        }
        
        router.get(route(rutaBase), { 
            rango: 'personalizado',
            desde: fechas.desde,
            hasta: fechas.hasta
        }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const opcionesRapidas = [
        { value: 'hoy', label: 'Hoy' },
        { value: 'semana', label: 'Esta Semana' },
        { value: 'mes', label: 'Este Mes' },
        { value: 'mes_anterior', label: 'Mes Anterior' },
        { value: '2_meses', label: '2 Meses' },
        { value: '6_meses', label: '6 Meses' },
        { value: 'anual', label: 'Anual' }
    ];

    return (
        <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center bg-white p-4 rounded-xl shadow-sm border border-gray-100 gap-4">
            
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center w-full xl:w-auto">
                <h2 className="text-lg font-bold text-gray-800 whitespace-nowrap">Filtros de Período</h2>
                
                {/* Botones de filtros rápidos */}
                <div className="flex flex-wrap gap-2">
                    {opcionesRapidas.map((opcion) => (
                        <button
                            key={opcion.value}
                            onClick={() => handleRangoChange(opcion.value)}
                            className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                                rangoActual === opcion.value
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                            }`}
                        >
                            {opcion.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Búsqueda por rango personalizado */}
            <div className={`flex flex-wrap items-center gap-2 p-2 rounded-lg border transition-colors ${rangoActual === 'personalizado' ? 'border-blue-300 bg-blue-50' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Desde</span>
                    <input 
                        type="date" 
                        value={fechas.desde}
                        onChange={(e) => setFechas({ ...fechas, desde: e.target.value })}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500 font-semibold uppercase">Hasta</span>
                    <input 
                        type="date" 
                        value={fechas.hasta}
                        onChange={(e) => setFechas({ ...fechas, hasta: e.target.value })}
                        className="text-sm border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500 py-1.5"
                    />
                </div>
                <button 
                    onClick={handleBusquedaPersonalizada}
                    className={`ml-2 px-4 py-1.5 rounded-md text-sm font-bold transition-colors ${rangoActual === 'personalizado' ? 'bg-blue-600 text-white shadow hover:bg-blue-700' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                    Buscar Rango
                </button>
            </div>

        </div>
    );
}
