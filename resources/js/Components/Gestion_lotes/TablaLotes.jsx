import React, { useState, useEffect } from 'react';
import { Link } from '@inertiajs/react';


export default function TablaLotes({ lotes = [] }) {
    const [visibleCount, setVisibleCount] = useState(10);

    // Resetear la paginación a 10 si cambian los lotes (ej: al filtrar por KPI)
    useEffect(() => {
        setVisibleCount(10);
    }, [lotes]);

    const visibleLotes = lotes.slice(0, visibleCount);

    const handleLoadMore = () => {
        setVisibleCount(prev => prev + 10);
    };

    // Función simple para renderizar la etiqueta de color correcta
    const getEstadoBadge = (estado) => {
        switch (estado) {
            case 'critico': return <span className="bg-red-100 text-red-700 px-2 py-1 rounded text-xs font-bold">Crítico</span>;
            case 'advertencia': return <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-bold">Alerta</span>;
            case 'sano': return <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Sano</span>;
            default: return null;
        }
    };

    return (
        <div className="overflow-x-auto w-full">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-[#3b82f6] text-white w-6 h-6 rounded-full text-s">
                        <th className="p-4 font-semibold">Producto</th>
                        <th className="p-4 font-semibold">N° Lote</th>
                        <th className="p-4 font-semibold">Vencimiento</th>
                        <th className="p-4 font-semibold text-center">Stock</th>
                        <th className="p-4 font-semibold">Estado</th>
                        <th className="p-4 font-semibold text-center">Acciones</th>
                    </tr>
                    
                </thead>
                <tbody className="text-sm text-gray-700">
                    {/* Renderizado condicional por si el arreglo viene vacío */}
                    {lotes.length === 0 ? (
                        <tr>
                            <td colSpan="6" className="p-8 text-center text-gray-500 font-medium">
                                No hay lotes para mostrar.
                            </td>
                        </tr>
                    ) : (
                        visibleLotes.map((lote) => (
                            <tr key={lote.id} className="border-b border-gray-100 hover:bg-gray-50 transition">
                                <td className="p-4">
                                    <div className="font-medium text-gray-800">{lote.producto}</div>
                                    <div className="text-xs text-gray-400 mt-0.5">{lote.codigo_barras}</div>
                                </td>
                                <td className="p-4 text-black-500 text-xs">{lote.lote}</td>
                                <td className="p-4">
                                    <div>{lote.caducidad}</div>
                                    <div className={`text-xs mt-1 ${lote.estado === 'critico' ? 'text-red-500 font-bold' : 'text-gray-400'}`}>
                                        En {lote.dias} días
                                    </div>
                                </td>
                                <td className="p-4 font-bold text-center text-lg">{lote.stock}</td>
                                <td className="p-4">{getEstadoBadge(lote.estado)}</td>
                                <td className="p-4 text-center space-x-4">
                                    
                                    {/* Botón Eliminar -> Envía a movimientos extras pasando los datos por URL */}
                                    {lote.estado === 'critico' && (
                                        <Link 
                                            href={route('stock.movimientos', { codigo_barras: lote.codigo_barras, lote: lote.lote, motivo: 'vencimiento', cantidad: lote.stock })}
                                            className="text-red-600 hover:text-red-800 text-xs font-semibold uppercase"
                                        >
                                            Eliminar
                                        </Link>
                                    )}

                                    {/* Botón Promoción -> Solo aparece si el lote está sano o en advertencia */}
                                    {(lote.estado === 'sano' || lote.estado === 'advertencia') && (
                                        <Link 
                                            href={`/promociones/nueva?lote_id=${lote.id}`}
                                            className="text-blue-600 hover:text-blue-800 text-xs font-semibold uppercase"
                                        >
                                            Promoción
                                        </Link>
                                    )}

                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>

            {/* Botón Ver más */}
            {visibleCount < lotes.length && (
                <div className="p-6 text-center border-t border-gray-100 bg-gray-50/30">
                    <button 
                        onClick={handleLoadMore}
                        className="px-6 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold text-gray-700 hover:border-[#3b82f6] hover:text-[#3b82f6] transition-all shadow-sm hover:shadow-md"
                    >
                        Ver más ({lotes.length - visibleCount} restantes)
                    </button>
                </div>
            )}
        </div>
    );
}