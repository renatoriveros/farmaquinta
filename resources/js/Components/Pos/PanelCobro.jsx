export default function PanelCobro({ 
    subtotal, 
    descuento, 
    total, 
    onChangeDescuento, 
    onAnular,
    onPausar, 
    onAbrirCobro, 
    carritoVacio,
    tipoDescuento,
    onChangeTipoDescuento
}) {
    return (
        
        <div className="flex flex-col h-full justify-between">
            {/* PARTE SUPERIOR: Resumen y Descuentos */}
            <div>
                
                <div className="flex justify-between items-center border-b border-gray-100 pb-4 mb-4">
                    <h3 className="text-sm font-bold text-gray-800">
                        Resumen Venta
                    </h3>
                    
                    {/* BOTONES SUPERIORES: PAUSAR Y VACIAR */}
                    <div className="flex gap-2">
                        <button 
                            onClick={onPausar}
                            disabled={carritoVacio}
                            className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 font-semibold text-sm border border-transparent hover:border-amber-100"
                            title="Pausar venta para atender a otro cliente"
                        >
                            Dejar Pendiente
                        </button>

                        <button 
                            onClick={onAnular}
                            disabled={carritoVacio}
                            className="text-red-400 hover:text-red-600 hover:bg-red-50 px-3 py-1.5 rounded-lg transition-colors disabled:opacity-50 flex items-center gap-1 font-semibold text-sm border border-transparent hover:border-red-100"
                            title="Anular venta y vaciar carrito"
                        >
                            Vaciar Carrito
                        </button>
                    </div>
                </div>
                {/* 1. MOVIMOS EL BOTÓN DE VACIAR AQUÍ ARRIBA */}
              
                
             <div className="flex justify-between items-center mb-3 text-gray-600">
                    <span>Descuento:</span>
                    <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            min="0"
                            value={descuento || ''}
                            onChange={(e) => {
                                
                                const valor = Math.abs(parseInt(e.target.value) || 0);
                                onChangeDescuento(valor);
                            }}
                            placeholder="0"
                            className="w-24 text-right border border-gray-200 rounded-lg p-1 text-black-500 font-bold focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-colors"
                        />
                        <span className="text-green-500 font-bold ml-1">-</span>
                         {/* NUEVO: Selector de Tipo de Descuento */}
                        <select 
                            value={tipoDescuento}
                            onChange={(e) => onChangeTipoDescuento(e.target.value)}
                            className="bg-gray-50 border border-gray-200 text-gray-600 text-sm rounded-lg focus:ring-[#0f3b8e] focus:border-[#0f3b8e] outline-none font-bold cursor-pointer"
                        >
                            <option value="$">$</option>
                            <option value="%">%</option>
                        </select>
                      
                    </div>
                </div>
            </div>

            {/* PARTE INFERIOR: Total Gigante y Cuadrícula de Pagos */}
            <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex justify-between items-end mb-6">
                    <span className="text-gray-500 font-bold uppercase tracking-wider">Total a Pagar</span>
                    <span className="text-3xl font-black">
                        ${total.toLocaleString('es-CL')}
                    </span>
                </div>

                {/* 2. CUADRÍCULA (GRID) DE 4 BOTONES DE PAGO */}
                <div className="grid grid-cols-2 gap-3">
                    <button 
                        onClick={() => onAbrirCobro('efectivo')}
                        disabled={carritoVacio}
                        className="bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center gap-1"
                    >
                        
                        <span className="text-sm">Efectivo</span>
                    </button>

                    <button 
                        onClick={() => onAbrirCobro('debito')}
                        disabled={carritoVacio}
                        className="bg-blue-500 hover:bg-blue-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center gap-1"
                    >
                        
                        <span className="text-sm">Débito</span>
                    </button>

                    <button 
                        onClick={() => onAbrirCobro('credito')}
                        disabled={carritoVacio}
                        className="bg-indigo-500 hover:bg-indigo-600 disabled:bg-gray-300 text-white font-bold py-3 rounded-xl shadow-sm transition-colors flex flex-col items-center justify-center gap-1"
                    >
                        
                        <span className="text-sm">Crédito</span>
                    </button>
                </div>
            </div>
        </div>
    );
}