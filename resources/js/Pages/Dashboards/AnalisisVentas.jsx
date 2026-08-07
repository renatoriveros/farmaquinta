import React from 'react';
import PosLayout from '@/Layouts/PosLayout';
import FiltrosDashboard from '@/Components/BI/FiltrosDashboard';

export default function AnalisisVentas({ auth, huesos, radiografia, filtros }) {
    const { rango } = filtros;

    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(monto);
    };

    return (
        <PosLayout auth={auth} titulo="Análisis de Inventario y Ventas">
            <div className="max-w-7xl mx-auto space-y-8">
                
                {/* FILTROS REUTILIZABLES */}
                <FiltrosDashboard 
                    rutaBase="dashboard.analisis" 
                    rangoActual={filtros.rango} 
                    desdeActual={filtros.desde} 
                    hastaActual={filtros.hasta} 
                />

                <div className="space-y-8">

                {/* RADIOGRAFÍA DEL INVENTARIO (NUEVO MÓDULO) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-purple-50 to-white px-6 py-4 border-b border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800">Radiografía del Inventario (Sugerencias y Alertas)</h3>
                        <p className="text-xs text-gray-500 mt-1">Clasificación ABC, tipo de venta y riesgo de quiebre de stock cruzado con velocidad de venta.</p>
                    </div>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-100">
                                <tr>
                                    <th className="px-6 py-4">Producto</th>
                                    <th className="px-6 py-4">Clasificación</th>
                                    <th className="px-6 py-4">Patrón de Venta</th>
                                    <th className="px-6 py-4 text-center">Ventas (und/día)</th>
                                    <th className="px-6 py-4 text-center">Stock Actual</th>
                                    <th className="px-6 py-4 text-right">Diagnóstico & Sugerencia</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-50">
                                {radiografia && radiografia.length > 0 ? radiografia.map((prod, idx) => (
                                    <tr key={idx} className="hover:bg-purple-50/30 transition-colors">
                                        <td className="px-6 py-4">
                                            <p className="font-semibold text-gray-800">{prod.nombre}</p>
                                            <p className="text-xs text-gray-400">{prod.codigo_barras}</p>
                                        </td>
                                        <td className="px-6 py-4">
                                            {prod.clasificacion === 'A' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-orange-100 text-orange-700 border border-orange-200"> Alta (A)</span>}
                                            {prod.clasificacion === 'B' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200"> Media (B)</span>}
                                            {prod.clasificacion === 'C' && <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold bg-gray-100 text-gray-700 border border-gray-200"> Baja (C)</span>}
                                        </td>
                                        <td className="px-6 py-4">
                                            {prod.tipo_venta === 'Hormiga' && <span title={`${prod.unidades_por_boleta} unds por ticket`} className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-2 py-1 rounded border border-emerald-100">Constante (Goteo)</span>}
                                            {prod.tipo_venta === 'Normal' && <span title={`${prod.unidades_por_boleta} unds por ticket`} className="text-xs font-semibold text-gray-600 bg-gray-50 px-2 py-1 rounded border border-gray-200"> Normal</span>}
                                            {prod.tipo_venta === 'Lote' && <span title={`${prod.unidades_por_boleta} unds por ticket`} className="text-xs font-semibold text-purple-600 bg-purple-50 px-2 py-1 rounded border border-purple-100"> Esporádica</span>}
                                        </td>
                                        <td className="px-6 py-4 text-center font-medium text-gray-600">
                                            {Number(prod.velocidad_diaria).toFixed(1)}
                                        </td>
                                        <td className="px-6 py-4 text-center font-bold text-gray-800">
                                            {prod.stock_actual}
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {prod.dias_restantes <= 3 ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-bold text-red-600 animate-pulse flex items-center gap-1">
                                                         Cercano a quiebre                                                    </span>
                                                    <span className="text-[10px] text-gray-500">Quedan {prod.dias_restantes} días de stock</span>
                                                </div>
                                            ) : prod.dias_restantes <= 7 ? (
                                                <div className="flex flex-col items-end">
                                                    <span className="text-xs font-semibold text-amber-600">
                                                        Revisar pronto
                                                    </span>
                                                    <span className="text-[10px] text-gray-500">Quedan {prod.dias_restantes} días de stock</span>
                                                </div>
                                            ) : (
                                                <span className="text-xs text-green-600 font-medium">Stock Saludable ({prod.dias_restantes} días)</span>
                                            )}
                                        </td>
                                    </tr>
                                )) : (
                                    <tr>
                                        <td colSpan="6" className="px-6 py-8 text-center text-gray-500">
                                            No hay suficientes datos de venta para generar el analisis.
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* HUESOS (PRODUCTOS MUERTOS) */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    <div className="bg-gradient-to-r from-red-50 to-white px-6 py-4 border-b border-gray-100 flex justify-between items-center">
                        <div>
                            <h3 className="text-lg font-bold text-gray-800">Stock Muerto</h3>
                            <p className="text-xs text-gray-500 mt-1">Productos con stock que NO se han vendido el periodo</p>
                        </div>
                        <span className="bg-red-100 text-red-700 text-xs font-bold px-3 py-1 rounded-full border border-red-200">
                            Peligro de Merma
                        </span>
                    </div>
                    <div className="p-6">
                        {huesos.length > 0 ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                                {huesos.map((prod, index) => (
                                    <div key={index} className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl border border-gray-100 hover:border-red-300 transition-colors">
                                        <div className="mt-0.5">
                                            <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                            </svg>
                                        </div>
                                        <div>
                                            <p className="font-semibold text-gray-800 text-sm leading-tight">{prod.nombre}</p>
                                            <p className="text-xs text-gray-500 mt-1">Stock Atrapado: <span className="font-bold text-red-600">{prod.stock_actual} und.</span></p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center py-8">
                                <svg className="w-12 h-12 text-green-500 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                                <p className="text-gray-600 font-medium">¡Excelente! Todo tu stock ha tenido movimiento en este período.</p>
                            </div>
                        )}
                    </div>
                </div>

            </div>
            </div>
        </PosLayout>
    );
}
