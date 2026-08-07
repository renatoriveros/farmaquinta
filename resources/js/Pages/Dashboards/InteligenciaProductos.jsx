import React from 'react';
import PosLayout from '@/Layouts/PosLayout';
import FiltrosDashboard from '@/Components/BI/FiltrosDashboard';

export default function InteligenciaProductos({ auth, top_cantidad, top_rentabilidad, filtros }) {
    const { rango } = filtros;

    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(monto);
    };

    return (
        <PosLayout auth={auth} titulo="Inteligencia de Productos">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* FILTROS REUTILIZABLES */}
                <FiltrosDashboard 
                    rutaBase="dashboard.productos" 
                    rangoActual={filtros.rango} 
                    desdeActual={filtros.desde} 
                    hastaActual={filtros.hasta} 
                />

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    
                    {/* TOP 10 POR VOLUMEN */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-blue-50 to-white px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Top 10 Más Vendidos (Volumen)</h3>
                            <p className="text-xs text-gray-500 mt-1">Los productos que más unidades venden</p>
                        </div>
                        <div className="p-6">
                            {top_cantidad.length > 0 ? (
                                <ul className="space-y-4">
                                    {top_cantidad.map((prod, index) => (
                                        <li key={index} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-sm">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm group-hover:text-blue-600 transition-colors">{prod.nombre}</p>
                                                    <p className="text-xs text-gray-400">{prod.codigo_barra}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800">{prod.total_unidades} und.</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-4 text-sm">No hay datos en este período.</p>
                            )}
                        </div>
                    </div>

                    {/* TOP 10 POR RENTABILIDAD */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="bg-gradient-to-r from-green-50 to-white px-6 py-4 border-b border-gray-100">
                            <h3 className="text-lg font-bold text-gray-800">Top 10 Más Rentables (Ingresos)</h3>
                            <p className="text-xs text-gray-500 mt-1">Los productos que más dinero ingresan a caja</p>
                        </div>
                        <div className="p-6">
                            {top_rentabilidad.length > 0 ? (
                                <ul className="space-y-4">
                                    {top_rentabilidad.map((prod, index) => (
                                        <li key={index} className="flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-8 h-8 rounded-full bg-green-100 text-green-700 flex items-center justify-center font-bold text-sm">
                                                    #{index + 1}
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-800 text-sm group-hover:text-green-600 transition-colors">{prod.nombre}</p>
                                                    <p className="text-xs text-gray-400">{prod.codigo_barra}</p>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <p className="font-bold text-gray-800">{formatearDinero(prod.total_dinero)}</p>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p className="text-gray-500 text-center py-4 text-sm">No hay datos en este período.</p>
                            )}
                        </div>
                    </div>
                </div>

            </div>
        </PosLayout>
    );
}
