import React from 'react';
import PosLayout from '@/Layouts/PosLayout';
import FiltrosDashboard from '@/Components/BI/FiltrosDashboard';
import { router } from '@inertiajs/react';
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer
} from 'recharts';

export default function RendimientoVentas({ auth, kpis, grafico, filtros }) {
    const { rango } = filtros;

    const handleRangoChange = (nuevoRango) => {
        router.get(route('dashboard.rendimiento'), { rango: nuevoRango }, {
            preserveState: true,
            preserveScroll: true
        });
    };

    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP',
            minimumFractionDigits: 0
        }).format(monto);
    };

    return (
        <PosLayout auth={auth} titulo="Rendimiento de Ventas">
            <div className="max-w-7xl mx-auto space-y-6">
                
                {/* FILTROS REUTILIZABLES */}
                <FiltrosDashboard 
                    rutaBase="dashboard.rendimiento" 
                    rangoActual={filtros.rango} 
                    desdeActual={filtros.desde} 
                    hastaActual={filtros.hasta} 
                />

                {/* KPIS RAPIDOS */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Tarjeta Total Vendido */}
                    <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
                        <div className="relative z-10">
                            <p className="text-blue-100 text-sm font-semibold uppercase tracking-wider mb-1">Total Vendido</p>
                            <h3 className="text-4xl font-black tracking-tight">{formatearDinero(kpis.total_vendido)}</h3>
                        </div>
                        <svg className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10" fill="currentColor" viewBox="0 0 24 24">
                            <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 15h-2v-2h2v2zm0-4h-2V7h2v6z" />
                        </svg>
                    </div>

                    {/* Tarjeta N° Boletas */}
                    <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">N° Boletas Emitidas</p>
                        <h3 className="text-4xl font-black text-gray-800 tracking-tight">{kpis.total_boletas}</h3>
                    </div>

                    {/* Tarjeta Ticket Promedio */}
                    <div className="bg-white rounded-2xl p-6 text-gray-800 shadow-sm border border-gray-100 flex flex-col justify-center">
                        <p className="text-gray-500 text-sm font-semibold uppercase tracking-wider mb-1">Ticket Promedio</p>
                        <h3 className="text-4xl font-black text-gray-800 tracking-tight">{formatearDinero(kpis.ticket_promedio)}</h3>
                    </div>
                </div>

                {/* GRAFICO */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Curva de Ingresos</h3>
                    <div className="h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={grafico} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                <XAxis 
                                    dataKey="label" 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }} 
                                    dy={10}
                                />
                                <YAxis 
                                    axisLine={false} 
                                    tickLine={false} 
                                    tick={{ fill: '#6b7280', fontSize: 12 }}
                                    tickFormatter={(value) => `$${(value / 1000)}k`}
                                    dx={-10}
                                />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                                    formatter={(value) => [formatearDinero(value), 'Total Vendido']}
                                    labelStyle={{ color: '#374151', fontWeight: 'bold', marginBottom: '4px' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="total" 
                                    stroke="#3b82f6" 
                                    strokeWidth={4}
                                    dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                                    activeDot={{ r: 8, strokeWidth: 0 }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

            </div>
        </PosLayout>
    );
}
