import React from 'react';

export default function CarritoUnificado({
    carrito,
    setCarrito,
    proveedores,
    formatearDinero,
    enviando,
    enviarCarritosAB2B
}) {
    const getTotalCarrito = () => carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    
    const badgeMap = {
        sky: { text: 'text-sky-600', bg: 'bg-sky-50' },
        orange: { text: 'text-orange-600', bg: 'bg-orange-50' },
        lime: { text: 'text-lime-600', bg: 'bg-lime-50' },
        emerald: { text: 'text-emerald-600', bg: 'bg-emerald-50' },
        purple: { text: 'text-purple-600', bg: 'bg-purple-50' },
        rose: { text: 'text-rose-600', bg: 'bg-rose-50' },
        amber: { text: 'text-amber-600', bg: 'bg-amber-50' }
    };

    return (
        <div className="w-full lg:w-96 max-h-[50vh] lg:max-h-none bg-white border-l border-gray-200 flex flex-col shadow-2xl z-20">
            <div className="p-5 border-b border-gray-100 bg-gray-50 flex flex-col items-center justify-center">
                <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mb-3">
                    <span className="text-2xl font-black">$</span>
                </div>
                <h2 className="text-lg font-medium text-gray-600 text-center">Seleccione productos para comparar sus precios en esta sección</h2>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-gray-50/50">
                {carrito.length > 0 && carrito.map((item) => (
                    <div key={item.id} className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm relative group">
                        <button 
                            onClick={() => setCarrito(carrito.filter(c => c.id !== item.id))}
                            className="absolute top-3 right-3 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                        >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                        </button>
                        
                        <p className="text-sm font-bold text-gray-800 pr-6 leading-tight mb-2">{item.producto}</p>
                        
                        <div className="flex justify-between items-end">
                            <div>
                                <span className={`text-[10px] font-bold uppercase tracking-wider ${badgeMap[item.color]?.text || 'text-gray-600'} ${badgeMap[item.color]?.bg || 'bg-gray-50'} px-2 py-0.5 rounded-md`}>
                                    {proveedores.find(p => p.id === item.proveedor)?.nombre}
                                </span>
                                <p className="font-black text-gray-800 mt-1">{formatearDinero(item.precio)}</p>
                            </div>
                            
                            <div className="flex items-center gap-3 bg-gray-100 rounded-lg p-1">
                                <button 
                                    onClick={() => setCarrito(carrito.map(c => c.id === item.id ? {...c, cantidad: Math.max(1, c.cantidad - 1)} : c))}
                                    className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 font-bold hover:text-blue-600"
                                >-</button>
                                <span className="text-sm font-bold w-4 text-center">{item.cantidad}</span>
                                <button 
                                    onClick={() => setCarrito(carrito.map(c => c.id === item.id ? {...c, cantidad: c.cantidad + 1} : c))}
                                    className="w-6 h-6 rounded bg-white shadow-sm flex items-center justify-center text-gray-600 font-bold hover:text-blue-600"
                                >+</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-6 bg-white border-t border-gray-100">
                <div className="flex justify-between items-center mb-6">
                    <span className="text-gray-500 font-bold uppercase tracking-wider text-sm">Total</span>
                    <span className="text-3xl font-black text-gray-800">{formatearDinero(getTotalCarrito())}</span>
                </div>
                
                <button 
                    disabled={carrito.length === 0 || enviando}
                    onClick={enviarCarritosAB2B}
                    className={`w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-all ${
                        carrito.length === 0 || enviando
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                            : 'bg-green-500 hover:bg-green-600 text-white shadow-lg hover:shadow-green-500/30 hover:-translate-y-0.5'
                    }`}
                >
                    <svg className={`w-6 h-6 ${enviando ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {enviando ? (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        ) : (
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                        )}
                    </svg>
                    {enviando ? 'Inyectando productos...' : 'Auto-Completar Carritos'}
                </button>
            </div>
        </div>
    );
}
