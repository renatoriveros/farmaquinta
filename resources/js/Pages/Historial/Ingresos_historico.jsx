import React, { useState, useEffect } from 'react';
import PosLayout from '@/Layouts/PosLayout';
import { Head } from '@inertiajs/react';
import TablaLotesDetalle from '@/Components/Historial/Tabla_lotes_detalle';

export default function IngresosHistorico({ auth, ingresos }) {
    const [searchTerm, setSearchTerm] = useState('');
    const [fechaDesde, setFechaDesde] = useState('');
    const [fechaHasta, setFechaHasta] = useState('');
    const [visibleCount, setVisibleCount] = useState(10);
    
    // Resetear contador cuando cambian los filtros
    useEffect(() => {
        setVisibleCount(10);
    }, [searchTerm, fechaDesde, fechaHasta]);
    
    const [modalAbierto, setModalAbierto] = useState(false);
    const [ingresoSeleccionado, setIngresoSeleccionado] = useState(null);

    // Lógica de Filtrado: Búsqueda de texto + Rango de Fechas
    const filteredIngresos = ingresos.filter(ingreso => {
        // Filtro de texto
        const folioStr = ingreso.folio_documento ? ingreso.folio_documento.toString().toLowerCase() : '';
        const proveedorNombre = ingreso.proveedor?.nombre_empresa ? ingreso.proveedor.nombre_empresa.toLowerCase() : '';
        const search = searchTerm.toLowerCase();
        
        const coincideTexto = folioStr.includes(search) || proveedorNombre.includes(search);

        // Filtro de fechas comparando strings YYYY-MM-DD directamente
        let coincideFecha = true;
        const fechaSoloDia = ingreso.fecha_ingreso.split(' ')[0]; // Asegura formato YYYY-MM-DD

        if (fechaDesde && fechaSoloDia < fechaDesde) {
            coincideFecha = false;
        }

        if (fechaHasta && fechaSoloDia > fechaHasta) {
            coincideFecha = false;
        }

        return coincideTexto && coincideFecha;
    });

    const visibleIngresos = filteredIngresos.slice(0, visibleCount);
    
    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    const abrirModal = (ingreso) => {
        setIngresoSeleccionado(ingreso);
        setModalAbierto(true);
    };

    return (
        <PosLayout 
            auth={auth} 
            titulo="Historial de Ingresos de Mercadería"
        >
            <Head title="Historial Ingresos" />

            <div className="flex flex-col h-full bg-gray-50 p-6 space-y-6">
                
                {/* Cabecera / Buscador y Filtros */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col xl:flex-row items-center justify-between gap-4">
                    <div className="w-full xl:w-auto">
                        <h2 className="text-xl font-bold text-gray-800">Registros de Ingreso</h2>
                        <p className="text-sm text-gray-500">Historial completo de mercadería recibida mediante facturas</p>
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm font-medium text-gray-600">Desde:</span>
                            <input
                                type="date"
                                className="block w-full py-2 px-3 border border-gray-200 rounded-lg text-sm focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm font-medium text-gray-600">Hasta:</span>
                            <input
                                type="date"
                                className="block w-full py-2 px-3 border border-gray-200 rounded-lg text-sm focus:ring-[#3b82f6] focus:border-[#3b82f6]"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>

                        {/* Botón para limpiar fechas */}
                        {(fechaDesde || fechaHasta) && (
                            <button 
                                onClick={() => { setFechaDesde(''); setFechaHasta(''); }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded-lg text-sm font-medium transition-colors border border-gray-200"
                                title="Limpiar fechas"
                            >
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                                </svg>
                                Limpiar
                            </button>
                        )}

                        <div className="relative w-full md:w-72">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                </svg>
                            </div>
                            <input
                                type="text"
                                placeholder="Buscar por folio o proveedor..."
                                className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#3b82f6] focus:border-[#3b82f6] transition-all duration-200 sm:text-sm"
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
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Folio Factura</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Proveedor</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Lotes (Prod.)</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha Ingreso</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                    <th className="py-4 px-6 text-xs font-semibold text-gray-500 uppercase tracking-wider text-center">Acciones</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filteredIngresos.length > 0 ? (
                                    visibleIngresos.map((ingreso) => (
                                        <tr key={ingreso.id_ingreso} className="hover:bg-blue-50/50 transition-colors">
                                            <td className="py-4 px-6">
                                                <div className="font-bold text-gray-800">#{ingreso.folio_documento}</div>
                                            </td>
                                            <td className="py-4 px-6">
                                                <div className="text-sm font-medium text-gray-900">{ingreso.proveedor?.nombre_empresa || 'Desconocido'}</div>
                                                <div className="text-xs text-gray-500">RUT: {ingreso.proveedor?.identificacion_fiscal || 'N/A'}</div>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <div className="inline-block text-sm font-bold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-md border border-blue-100">
                                                    {ingreso.lotes_historia?.length || 0} Lotes
                                                </div>
                                            </td>
                                            <td className="py-4 px-6 text-sm text-gray-600">
                                                {(() => {
                                                    const parts = ingreso.fecha_ingreso.split(' ')[0].split('-');
                                                    if (parts.length === 3) {
                                                        const dateObj = new Date(parts[0], parts[1] - 1, parts[2]);
                                                        return dateObj.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
                                                    }
                                                    return ingreso.fecha_ingreso;
                                                })()}
                                            </td>
                                            <td className="py-4 px-6">
                                                <span className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                                                    ingreso.estado_cuadratura === 'Cuadrado' 
                                                        ? 'bg-green-100 text-green-800' 
                                                        : 'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                    {ingreso.estado_cuadratura}
                                                </span>
                                            </td>
                                            <td className="py-4 px-6 text-center">
                                                <button 
                                                    onClick={() => abrirModal(ingreso)}
                                                    className="text-[#3b82f6] hover:text-blue-800 font-medium text-sm transition-colors border border-transparent hover:border-blue-200 px-3 py-1.5 rounded-lg"
                                                >
                                                    Ver Lotes
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="6" className="py-12 text-center text-gray-500">
                                            <div className="flex flex-col items-center justify-center">
                                                <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                                                </svg>
                                                <p className="text-lg font-medium text-gray-900">No se encontraron ingresos</p>
                                                <p className="text-sm">Intenta ajustar los filtros de fecha o la búsqueda.</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                    {/* Botón Ver más */}
                    {visibleCount < filteredIngresos.length && (
                        <div className="p-4 text-center border-t border-gray-100 bg-gray-50/50">
                            <button 
                                onClick={handleLoadMore}
                                className="px-6 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold text-gray-700 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all shadow-sm"
                            >
                                Ver más ({filteredIngresos.length - visibleCount} restantes)
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL PARA VER LOS LOTES (Extraído a su propio componente para evitar spaghetti code) */}
            <TablaLotesDetalle 
                isOpen={modalAbierto} 
                onClose={() => setModalAbierto(false)} 
                ingreso={ingresoSeleccionado} 
            />
        </PosLayout>
    );
}
