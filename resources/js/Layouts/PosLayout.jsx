import { Head, Link, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function PosLayout({ auth, children, titulo }) {
    // Obtenemos la URL actual para saber qué botón del menú pintar de azul
    const { url } = usePage();

    // Verificamos si el usuario es un cajero y si NO tiene un turno activo en la BD
    const requiereApertura = auth.user.rol === 'Cajero' && !auth.turno_activo;

    // Formulario de Inertia para enviar el monto de apertura al backend
    const { data, setData, post, processing, errors } = useForm({
        monto_apertura: '',
    });

    const handleAbrirTurno = (e) => {
        e.preventDefault();
        post(route('turno.abrir'));
    };

    return (
        <div className="flex h-screen bg-[#f4f7f6] font-sans relative">
            <Head title={`${titulo} - Farmaquinta`} />

            {/* BARRA LATERAL (SIDEBAR ESTÁTICO) */}
            <aside className="w-64 bg-[#232936] text-gray-300 flex flex-col h-full shadow-2xl z-20">
                <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-[#3b82f6]">Farmaquinta</span> 
                    </h2>
                    <p className="text-xs text-gray-500 mt-1">Sucursal {auth.user.id_sucursal || 1} - Activa</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link href="/venta" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${url.startsWith('/venta') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}>
                        <span></span> Punto de Venta
                    </Link>
                    <Link href="/stock" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${url.startsWith('/stock') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}>
                        <span></span> Inventario
                    </Link>
                    <Link href="/historial" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${url.startsWith('/historial') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}>
                        <span></span> Historial
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-700/50 space-y-4">
                    <div className="px-4">
                        <p className="text-white font-medium text-sm">{auth.user.name}</p>
                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                            {auth.user.rol}
                        </p>
                    </div>
                    <Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-semibold">
                        <span></span> Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* CABECERA (HEADER ESTÁTICO) */}
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
                    <h1 className="text-2xl font-bold text-[#0f3b8e]">{titulo}</h1>

                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> SII Online
                        </div>
                    </div>
                </header>

                {/* AQUÍ SE INYECTAN TUS PÁGINAS (Venta, Stock, Historial) */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#f4f7f6]">
                    {children}
                </div>
            </main>

            {/* MODAL DE APERTURA DE TURNO (DIFUMINADO DEL FONDO) */}
            {requiereApertura && (
                <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-50 flex items-center justify-center p-4">
                    <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
                        {/* Cabecera del Modal */}
                        <div className="bg-[#0f3b8e] text-white p-6 text-center flex flex-col items-center">
                            
                            <h3 className="text-xl font-bold">Apertura de Turno</h3>
                            <p className="text-blue-200 text-xs mt-1">Declare su saldo inicial para habilitar las ventas</p>
                        </div>

                        {/* Formulario */}
                        <form onSubmit={handleAbrirTurno} className="p-6">
                            <div className="mb-6">
                                <label className="block text-sm font-bold text-gray-700 mb-2">Declarar Efectivo de Apertura</label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                        <span className="text-gray-500 font-bold">$</span>
                                    </div>
                                    <input 
                                        type="number" 
                                        required
                                        min="0"
                                        placeholder="0.00"
                                        value={data.monto_apertura}
                                        onChange={(e) => setData('monto_apertura', e.target.value)}
                                        className="w-full pl-8 pr-4 py-3.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-colors text-lg font-bold text-gray-800 bg-gray-50"
                                    />
                                </div>
                                {errors.monto_apertura && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.monto_apertura}</p>}
                                
                                {/* Montos Rápidos */}
                                <div className="flex gap-2 mt-3">
                                    {['50000', '100000', '150000'].map((monto) => (
                                        <button 
                                            key={monto}
                                            type="button"
                                            onClick={() => setData('monto_apertura', monto)}
                                            className="flex-1 py-1 px-2 border border-gray-200 hover:border-[#0f3b8e] hover:bg-blue-50 text-xs rounded font-semibold text-gray-600 hover:text-[#0f3b8e] transition-colors"
                                        >
                                            ${parseInt(monto).toLocaleString('es-CL')}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div className="mb-4 bg-gray-50 p-4 rounded-lg border border-gray-200 flex items-center gap-3">
                                
                                <div>
                                    <p className="text-xs text-gray-500 font-medium">Usuario actual</p>
                                    <p className="text-sm font-bold text-gray-800">{auth.user.name}</p>
                                </div>
                            </div>

                            {/* Botones de acción */}
                            <div className="space-y-2 mt-6">
                                <button 
                                    type="submit"
                                    disabled={processing}
                                    className="w-full bg-[#0f3b8e] hover:bg-[#0a2966] text-white font-bold py-3 px-4 rounded-lg transition-colors flex justify-center items-center gap-2 shadow"
                                >
                                    Confirmar y Abrir Turno <span>➜</span>
                                </button>

                                <Link 
                                    href={route('logout')} 
                                    method="post" 
                                    as="button" 
                                    className="w-full text-center text-sm text-red-600 hover:text-red-800 font-semibold py-2 transition-colors"
                                >
                                    Cancelar y Salir
                                </Link>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}