export default function CarritoVenta({ items, onModificar, onEliminar }) {
    
    // Si no hay productos, mostramos el diseño de carrito vacío
    if (items.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-full text-gray-400 p-12">
                <p className="text-xl font-medium">El carrito está vacío</p>
                <p className="text-sm mt-2">Escanee un producto para comenzar</p>
            </div>
        );
    }

    // Si hay productos, dibujamos la tabla
    return (
        <div className="flex-1 overflow-auto bg-white">
            <table className="w-full text-left border-collapse">
                <thead className="bg-gray-50/80 backdrop-blur-md sticky top-0 z-10 shadow-sm">
                    <tr>
                        <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider">Producto</th>
                        <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-32 text-center">Precio</th>
                        <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-32 text-center">Cant.</th>
                        <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-32 text-right">Subtotal</th>
                        <th className="p-4 font-bold text-gray-500 text-xs uppercase tracking-wider w-16 text-center"></th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {items.map((item) => (
                        <tr key={item.id_producto} className="hover:bg-blue-50/40 transition-colors group">
                            
                           {/* Nombre del Producto y Alertas */}
                            <td className="p-4">
                                <p className="font-bold text-gray-900 text-base">{item.nombre_comercial}</p>
                                
                                <div className="flex items-center justify-between mt-1 gap-4">
                                    {item.codigo_barras && (
                                        <p className="text-xs text-gray-400 font-mono">COD: {item.codigo_barras}</p>
                                    )}
                                    
                                    <div className="flex gap-4 ml-auto">
                                        {item.requiere_receta == 1 && (
                                            <span className="text-red-600 font-bold text-xs tracking-tight whitespace-nowrap">
                                                 Requiere Receta
                                            </span>
                                        )}
                                        {item.receta_retenida == 1 && (
                                            <span className="text-red-600 font-bold text-xs tracking-tight whitespace-nowrap">
                                               * Receta Retenida *
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </td>

                            {/* Precio Unitario */}
                            <td className="p-4 text-center font-semibold text-gray-600">
                                ${item.precio_venta.toLocaleString('es-CL')}
                            </td>

                            {/* Controles de Cantidad */}
                            <td className="p-4 text-center">
                                <div className="flex items-center justify-center gap-1 bg-gray-100 rounded-lg p-1 w-max mx-auto border border-gray-200">
                                    <button 
                                        onClick={() => onModificar(item.id_producto, -1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600 font-bold active:scale-95 transition-transform"
                                    >-</button>
                                    <span className="w-10 text-center font-bold text-gray-800">
                                        {item.cantidad}
                                    </span>
                                    <button 
                                        onClick={() => onModificar(item.id_producto, 1)}
                                        className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm hover:bg-gray-50 text-gray-600 font-bold active:scale-95 transition-transform"
                                    >+</button>
                                </div>
                            </td>

                            {/* Subtotal del Item */}
                            <td className="p-4 text-right font-black text-[#0f3b8e] text-lg">
                                ${(item.precio_venta * item.cantidad).toLocaleString('es-CL')}
                            </td>

                            {/* Botón Eliminar */}
                            <td className="p-4 text-center">
                                <button 
                                    onClick={() => onEliminar(item.id_producto)}
                                    className="text-red-400 hover:text-red-600 hover:bg-red-50 p-2 rounded-lg transition-colors opacity-50 group-hover:opacity-100"
                                    title="Eliminar producto"
                                >
                                    ✖
                                </button>
                            </td>

                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}