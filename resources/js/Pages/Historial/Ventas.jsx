import React, { useState, useEffect } from 'react';
import PosLayout from '@/Layouts/PosLayout';
import { Head, router, Link } from '@inertiajs/react';
import ModalDetalleVenta from '@/Components/Historial/ModalDetalleVenta';

export default function Ventas({ auth, ventas, filtros }) {
    const [searchTerm, setSearchTerm] = useState(filtros?.search || '');
    const [fechaDesde, setFechaDesde] = useState(filtros?.desde || '');
    const [fechaHasta, setFechaHasta] = useState(filtros?.hasta || '');

    const [modalAbierto, setModalAbierto] = useState(false);
    const [ventaSeleccionada, setVentaSeleccionada] = useState(null);

    const aplicarFiltros = () => {
        router.get(
            route('historial.ventas'),
            {
                search: searchTerm,
                desde: fechaDesde,
                hasta: fechaHasta
            },
            {
                preserveState: true,
                preserveScroll: true,
                replace: true,
            }
        );
    };

    const abrirDetalle = (venta) => {
        setVentaSeleccionada(venta);
        setModalAbierto(true);
    };

    return (
        <PosLayout auth={auth} titulo="Historial de Ventas">
            <Head title="Historial de Ventas" />

            <div className="flex flex-col h-full bg-gray-50 p-6 space-y-6">
                
                {/* Cabecera / Buscador y Filtros */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col xl:flex-row items-center justify-between gap-4 shrink-0">
                    <div className="w-full xl:w-auto">
                        <h2 className="text-xm font-bold text-gray-800">Boletas Emitidas </h2>
                        
                    </div>

                    <div className="flex flex-col md:flex-row items-center gap-3 w-full xl:w-auto">
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm font-medium text-gray-600">Desde:</span>
                            <input
                                type="date"
                                className="block w-full py-2 px-3 border border-gray-200 rounded-lg text-sm focus:ring-[#0f3b8e] focus:border-[#0f3b8e]"
                                value={fechaDesde}
                                onChange={(e) => setFechaDesde(e.target.value)}
                            />
                        </div>
                        
                        <div className="flex items-center gap-2 w-full md:w-auto">
                            <span className="text-sm font-medium text-gray-600">Hasta:</span>
                            <input
                                type="date"
                                className="block w-full py-2 px-3 border border-gray-200 rounded-lg text-sm focus:ring-[#0f3b8e] focus:border-[#0f3b8e]"
                                value={fechaHasta}
                                onChange={(e) => setFechaHasta(e.target.value)}
                            />
                        </div>

                        {(fechaDesde || fechaHasta || searchTerm) && (
                            <button 
                                onClick={() => { 
                                    setFechaDesde(''); 
                                    setFechaHasta(''); 
                                    setSearchTerm(''); 
                                    router.get(route('historial.ventas'), {}, { preserveState: true, preserveScroll: true });
                                }}
                                className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-red-50 text-gray-600 hover:text-red-600 rounded-lg text-sm font-medium transition-colors border border-gray-200 hover:border-red-200"
                                title="Limpiar filtros"
                            >
                                Limpiar
                            </button>
                        )}

                        <div className="flex gap-2 w-full md:w-auto">
                            <div className="relative w-full md:w-72">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <span className="text-gray-400">🔍</span>
                                </div>
                                <input
                                    type="text"
                                    placeholder="N° Venta, receta o cajero..."
                                    className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg bg-gray-50 placeholder-gray-400 focus:outline-none focus:bg-white focus:ring-2 focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-all text-sm"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && aplicarFiltros()}
                                />
                            </div>
                            <button
                                onClick={aplicarFiltros}
                                className="px-4 py-2 bg-[#0f3b8e] text-white rounded-lg text-sm font-bold hover:bg-[#0f3b8e]/90 transition-colors shadow-sm"
                            >
                                Buscar
                            </button>
                        </div>
                    </div>
                </div>

                {/* Grid de Cards y Paginación */}
                <div className="flex-1 overflow-auto flex flex-col">
                    {ventas.data.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6 pb-6">
                                {ventas.data.map((venta) => {
                                    const fechaSafe = venta.fecha_hora ? venta.fecha_hora.replace(' ', 'T') : null;
                                    const isEfectivo = venta.metodo_pago === 'Efectivo';
                                    
                                    return (
                                        <div 
                                            key={venta.id_venta} 
                                            className="bg-white rounded-2xl shadow-sm border border-gray-100 hover:shadow-md hover:border-[#0f3b8e]/30 transition-all duration-300 group flex flex-col overflow-hidden"
                                        >
                                            <div className={`h-2 w-full ${isEfectivo ? 'bg-emerald-400' : 'bg-blue-400'}`}></div>
                                            <div className="p-5 flex-1 flex flex-col">
                                                <div className="flex justify-between items-start mb-4">
                                                    <div>
                                                        <span className="text-xs font-bold uppercase tracking-wider text-gray-400 block mb-1">Boleta</span>
                                                        <h3 className="text-xl font-black text-gray-800">#{venta.id_venta}</h3>
                                                    </div>
                                                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${
                                                        isEfectivo 
                                                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                                                            : 'bg-blue-50 text-blue-700 border-blue-200'
                                                    }`}>
                                                        {venta.metodo_pago}
                                                    </span>
                                                </div>

                                                <div className="space-y-3 flex-1">
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Fecha:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {fechaSafe ? new Date(fechaSafe).toLocaleDateString('es-CL') : '--'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Hora:</span>
                                                        <span className="font-semibold text-gray-800">
                                                            {fechaSafe ? new Date(fechaSafe).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'}) : '--'}
                                                        </span>
                                                    </div>
                                                    <div className="flex items-center justify-between text-sm">
                                                        <span className="text-gray-500">Cajero:</span>
                                                        <span className="font-semibold text-gray-800 text-right truncate max-w-[150px]">
                                                            {venta.usuario?.name || 'Desconocido'}
                                                        </span>
                                                    </div>
                                                    {venta.folio_receta && (
                                                        <div className="flex items-center justify-between text-sm">
                                                            <span className="text-gray-500">Receta:</span>
                                                            <span className="font-semibold text-amber-600 bg-amber-50 px-2 rounded">
                                                                {venta.folio_receta}
                                                            </span>
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="mt-5 pt-4 border-t border-gray-100">
                                                    <div className="flex justify-between items-end mb-4">
                                                        <span className="text-gray-500 text-sm font-medium">Total:</span>
                                                        <span className="text-2xl font-black text-[#0f3b8e]">
                                                            ${Number(venta.total_venta).toLocaleString('es-CL')}
                                                        </span>
                                                    </div>
                                                    <button 
                                                        onClick={() => abrirDetalle(venta)}
                                                        className="w-full py-2.5 bg-gray-50 hover:bg-[#0f3b8e] text-[#0f3b8e] hover:text-white rounded-xl font-bold text-sm transition-colors border border-gray-200 hover:border-[#0f3b8e]"
                                                    >
                                                        Ver Detalle
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                            
                            {/* Paginación del Servidor */}
                            <div className="flex justify-center items-center pb-6 gap-2 mt-auto">
                                {ventas.links.map((link, index) => {
                                    // Limpiamos los textos raros de Laravel como &laquo; y &raquo;
                                    let label = link.label;
                                    if (label.includes('&laquo;')) label = 'Anterior';
                                    if (label.includes('&raquo;')) label = 'Siguiente';
                                    
                                    return link.url ? (
                                        <Link
                                            key={index}
                                            href={link.url}
                                            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors border ${
                                                link.active 
                                                    ? 'bg-[#0f3b8e] text-white border-[#0f3b8e]' 
                                                    : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                                            }`}
                                        >
                                            {label}
                                        </Link>
                                    ) : (
                                        <span 
                                            key={index} 
                                            className="px-4 py-2 rounded-lg text-sm font-semibold bg-gray-100 text-gray-400 border border-transparent cursor-not-allowed"
                                        >
                                            {label}
                                        </span>
                                    );
                                })}
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex flex-col items-center justify-center text-center p-12 bg-white rounded-2xl border border-gray-100">
                            <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center mb-4">
                                <span className="text-5xl">🧾</span>
                            </div>
                            <h3 className="text-xl font-bold text-gray-800 mb-2">No se encontraron ventas</h3>
                            <p className="text-gray-500 max-w-md">No hay boletas que coincidan con los filtros de búsqueda o rango de fechas seleccionado.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* MODAL DE DETALLE DE VENTA */}
            <ModalDetalleVenta 
                isOpen={modalAbierto}
                onClose={() => setModalAbierto(false)}
                venta={ventaSeleccionada}
            />
        </PosLayout>
    );
}
