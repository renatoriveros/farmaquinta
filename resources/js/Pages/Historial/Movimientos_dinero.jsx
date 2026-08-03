import React, { useState, useEffect } from 'react';
import PosLayout from '@/Layouts/PosLayout';
import { Head } from '@inertiajs/react';

export default function MovimientosDinero({ auth, movimientos }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [filtroTipo, setFiltroTipo] = useState('todos');
    const [visibleCount, setVisibleCount] = useState(10);

    // Resetear contador cuando cambian los filtros
    useEffect(() => {
        setVisibleCount(10);
    }, [searchTerm, fechaDesde, fechaHasta, filtroTipo]);

    // Lógica de Filtrado: Búsqueda + Rango Fechas + Tipo
    const filteredMovimientos = movimientos.filter(mov => {
        // Texto
        const concepto = mov.concepto ? mov.concepto.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        
        const coincideTexto = concepto.includes(search);

        // Fecha
        let coincideFecha = true;
        const fechaMov = new Date(mov.fecha_hora).getTime();

        if (fechaDesde) {
            const desde = new Date(fechaDesde + 'T00:00:00').getTime();
            if (fechaMov < desde) coincideFecha = false;
        }

        if (fechaHasta) {
            const hasta = new Date(fechaHasta + 'T23:59:59').getTime();
            if (fechaMov > hasta) coincideFecha = false;
        }

        // Tipo
        let coincideTipo = true;
        if (filtroTipo !== 'todos' && mov.tipo_movimiento.toLowerCase() !== filtroTipo) {
            coincideTipo = false;
        }

        return coincideTexto && coincideFecha && coincideTipo;
    });

    const visibleMovimientos = filteredMovimientos.slice(0, visibleCount);
    
    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    return (
        <PosLayout 
            auth={auth} 
            titulo="Historial de Movimientos de Caja"
        >
            <Head title="Movimientos Caja" />

            <div className="flex flex-col h-full bg-gray-50 p-6 space-y-6">
                
                {/* Cabecera / Buscador y Filtros */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col xl:flex-row items-center justify-between gap-4">
                    <div className="w-full xl:w-auto">
                        <h2 className="text-xl font-bold text-gray-800">Busqueda</h2>
                        
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto flex-wrap">
                        
                        {/* Filtro Tipo */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Tipo:</span>
                            <select 
                                className="py-2 pl-3 pr-8 w-32 border border-gray-200 rounded-lg text-sm focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                value={filtroTipo}
                                onChange={(e) => setFiltroTipo(e.target.value)}
                            >
                                <option value="todos">Todos</option>
                                <option value="ingreso">Ingresos</option>
                                <option value="egreso">Egresos</option>
                            </select>
                        </div>

                        {/* Filtro Fechas */}
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Desde:</span>
                            <input
                                type="date"
                                className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:ring-[#3b82f6]"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-600">Hasta:</span>
                            <input
                                type="date"
                                className="py-2 px-3 border border-gray-200 rounded-lg text-sm focus:ring-[#3b82f6]"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>

                        {/* Botón limpiar */}
                        {(fechaDesde || fechaHasta || filtroTipo !== 'todos' || searchTerm) && (
                            <button 
                                onClick={() => { setFechaDesde(''); setFechaHasta(''); setFiltroTipo('todos'); setSearchTerm(''); }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Limpiar
                            </button>
                        )}

                        <div className="relative w-full md:w-56 lg:w-64">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por concepto..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                {/* Tabla de Resultados */}
                <div className="flex-1 bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50/50 border-b border-gray-100">
                                    <th className="w-[15%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha / Hora</th>
                                    <th className="w-[20%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Usuario (Turno)</th>
                                    <th className="w-[15%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Tipo</th>
                                    <th className="w-[15%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-left">Monto</th>
                                    <th className="w-[35%] py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Concepto</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredMovimientos.length > 0 ? (
                                    visibleMovimientos.map((mov) => (
                                        <tr key={mov.id_movimiento} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-semibold text-gray-800 text-sm">
                                                    {new Date(mov.fecha_hora).toLocaleDateString('es-CL', {
                                                        day: '2-digit', month: 'short', year: 'numeric'
                                                    })}
                                                </div>
                                                
                                            </td>
                                            
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-bold text-gray-900">
                                                    {mov.turno?.usuario?.name || 'Desconocido'}
                                                </div>
                                               
                                            </td>

                                            <td className="py-4 px-6 text-center">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-bold rounded-full ${
                                                    mov.tipo_movimiento.toLowerCase() === 'ingreso' 
                                                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' 
                                                        : 'bg-rose-100 text-rose-800 border border-rose-200'
                                                }`}>
                                                    {mov.tipo_movimiento.toUpperCase()}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6 text-left">
                                                <span className={`text-base font-black ${mov.tipo_movimiento.toLowerCase() === 'ingreso' ? 'text-emerald-600' : 'text-rose-600'}`}>
                                                    {mov.tipo_movimiento.toLowerCase() === 'ingreso' ? '+' : '-'}${Number(mov.monto).toLocaleString('es-CL')}
                                                </span>
                                            </td>

                                            <td className="py-4 px-6">
                                                <p className="text-sm font-medium text-gray-700 max-w-full break-words">
                                                    {mov.concepto || '--'}
                                                </p>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="5" className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                </svg>
                                                <p className="text-lg font-medium text-gray-900">No hay movimientos de dinero</p>
                                                <p className="text-sm">No se encontraron registros con estos filtros.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Botón Ver más */}
                    {visibleCount < filteredMovimientos.length && (
                        <div className="p-4 text-center border-t border-gray-100 bg-gray-50/50">
                            <button 
                                onClick={handleLoadMore}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all shadow-sm"
                            >
                                Ver más ({filteredMovimientos.length - visibleCount} restantes)
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </PosLayout>
    );
}
