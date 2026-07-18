export default function ModalVentasPendientes({ isOpen, onClose, pendientes, onRecuperar, onEliminar }) {
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden">
                
                {/* Cabecera */}
                <div className="bg-amber-500 p-4 text-white flex justify-between items-center">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                         Ventas en Espera
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-bold">✖</button>
                </div>

                {/* Lista de Pendientes */}
                <div className="p-6 max-h-[60vh] overflow-y-auto bg-gray-50">
                    {pendientes.length === 0 ? (
                        <div className="text-center text-gray-400 py-8">
                            <p>No hay ventas en espera</p>
                        </div>
                    ) : (
                        <div className="flex flex-col gap-3">
                            {pendientes.map((venta) => (
                                <div key={venta.id} className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm flex justify-between items-center hover:border-amber-300 transition-colors">
                                    
                                    <div>
                                        <p className="font-bold text-gray-800">
                                            Venta pausada a las {venta.hora}
                                        </p>
                                        <p className="text-sm text-gray-500">
                                            {venta.carrito.length} {venta.carrito.length === 1 ? 'producto' : 'productos'} en el carrito
                                        </p>
                                    </div>

                                    <div className="text-right px-4">
                                        <span className="block font-black text-[#0f3b8e] text-xl">
                                            ${venta.total.toLocaleString('es-CL')}
                                        </span>
                                    </div>

                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => onEliminar(venta.id)}
                                            className="p-2 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                            title="Eliminar venta en espera"
                                        >
                                            Eliminar
                                        </button>
                                        <button 
                                            onClick={() => onRecuperar(venta)}
                                            className="px-4 py-2 bg-amber-100 text-amber-700 hover:bg-amber-200 font-bold rounded-lg transition-colors"
                                        >
                                            Recuperar
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}