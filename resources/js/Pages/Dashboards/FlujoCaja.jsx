import React from 'react';
import PosLayout from '@/Layouts/PosLayout';
import FiltrosDashboard from '@/Components/BI/FiltrosDashboard';
import {
    PieChart,
    Pie,
    Cell,
    Tooltip,
    Legend,
    ResponsiveContainer
} from 'recharts';

export default function FlujoCaja({ auth, finanzas, stock_valorizado, grafico, filtros }) {
    const { rango } = filtros;
    const { ingresos_ventas, ingresos_extras, total_ingresos, egresos_caja, egresos_compras, total_egresos, flujo_neto } = finanzas;

    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(monto);
    };

    return (
        <PosLayout auth={auth} titulo="Flujo de Caja y Stock">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* FILTROS REUTILIZABLES */}
                <FiltrosDashboard 
                    rutaBase="dashboard.flujo" 
                    rangoActual={filtros.rango} 
                    desdeActual={filtros.desde} 
                    hastaActual={filtros.hasta} 
                />
                {/* KPIS FINANCIEROS */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    
                    {/* Tarjeta Ingresos Totales */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-emerald-500 p-4 hover:bg-emerald-50 transition-all">
                        <p className="text-xs text-emerald-600 font-bold uppercase tracking-wider mb-1">Ingresos Totales</p>
                        <p className="text-3xl font-extrabold text-emerald-900">{formatearDinero(total_ingresos)}</p>
                    </div>

                    {/* Tarjeta Egresos */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-rose-500 p-4 hover:bg-rose-50 transition-all">
                        <p className="text-xs text-rose-600 font-bold uppercase tracking-wider mb-1">Total Egresos</p>
                        <p className="text-3xl font-extrabold text-rose-900">{formatearDinero(total_egresos)}</p>
                    </div>

                    {/* Tarjeta Flujo Neto (Ganancia/Pérdida de la caja) */}
                    <div className={`bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 p-4 transition-all ${
                        flujo_neto >= 0 
                            ? 'border-l-green-500 hover:bg-green-50' 
                            : 'border-l-red-500 hover:bg-red-50'
                    }`}>
                        <p className={`text-xs font-bold uppercase tracking-wider mb-1 ${
                            flujo_neto >= 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                            Flujo Neto
                        </p>
                        <p className={`text-3xl font-extrabold ${
                            flujo_neto >= 0 ? 'text-green-800' : 'text-red-800'
                        }`}>
                            {formatearDinero(flujo_neto)}
                        </p>
                    </div>

                    {/* Tarjeta Valor en Bodega (Global) */}
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 border-l-4 border-l-indigo-600 p-4 hover:bg-indigo-50 transition-all">
                        <p className="text-xs text-indigo-600 font-bold uppercase tracking-wider mb-1">Stock Valorizado (Costo)</p>
                        <p className="text-3xl font-extrabold text-indigo-900">{formatearDinero(stock_valorizado)}</p>
                    </div>

                </div>

                {/* GRÁFICOS Y DETALLES */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Gráfico Circular */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col items-center">
                        <h3 className="text-lg font-bold text-gray-800 self-start mb-2">Composición del Flujo</h3>
                        {total_ingresos > 0 || total_egresos > 0 ? (
                            <div className="w-full h-80">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={grafico}
                                            cx="50%"
                                            cy="50%"
                                            innerRadius={80}
                                            outerRadius={110}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {grafico.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                        <Tooltip 
                                            formatter={(value) => formatearDinero(value)}
                                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                            itemStyle={{ fontWeight: 'bold' }}
                                        />
                                        <Legend 
                                            verticalAlign="bottom" 
                                            height={36} 
                                            iconType="circle"
                                            wrapperStyle={{ fontSize: '14px', fontWeight: '500' }}
                                        />
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                        ) : (
                            <div className="flex-1 flex flex-col items-center justify-center w-full h-64 border-2 border-dashed border-gray-200 rounded-xl">
                                <p className="text-gray-400 font-medium">No hay movimientos en este periodo</p>
                            </div>
                        )}
                    </div>

                    {/* Desglose Detallado */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <h3 className="text-lg font-bold text-gray-800 mb-6">Desglose de Movimientos</h3>
                        <div className="space-y-6">
                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Ventas Registradas</p>
                                        <p className="text-xs text-gray-500">Ingreso automático por caja</p>
                                    </div>
                                </div>
                                <p className="font-black text-lg text-gray-800">{formatearDinero(ingresos_ventas)}</p>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Ingresos Extraordinarios</p>
                                        <p className="text-xs text-gray-500">Movimientos de ingreso manual</p>
                                    </div>
                                </div>
                                <p className="font-black text-lg text-gray-800">{formatearDinero(ingresos_extras)}</p>
                            </div>

                            <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center text-orange-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M20 12H4" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Egresos de Caja</p>
                                        <p className="text-xs text-gray-500">Retiros, vales y salidas manuales</p>
                                    </div>
                                </div>
                                <p className="font-black text-lg text-gray-800">{formatearDinero(egresos_caja)}</p>
                            </div>

                            <div className="flex justify-between items-center">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600">
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                    </div>
                                    <div>
                                        <p className="font-semibold text-gray-800">Pago a Proveedores</p>
                                        <p className="text-xs text-gray-500">Compras de mercadería</p>
                                    </div>
                                </div>
                                <p className="font-black text-lg text-gray-800">{formatearDinero(egresos_compras)}</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </PosLayout>
    );
}
