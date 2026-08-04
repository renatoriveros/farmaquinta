import React from 'react';

export default function ModalDetalleVenta({ isOpen, onClose, venta }) {
    if (!isOpen || !venta) return null;

    const fechaSafe = venta.fecha_hora ? venta.fecha_hora.replace(' ', 'T') : null;
    const isEfectivo = venta.metodo_pago === 'Efectivo';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
                className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm transition-opacity"
                onClick={onClose}
            ></div>
            
            {/* Modal Content - narrower width */}
            <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in duration-200">
                {/* Header Ticket Style */}
                <div className="bg-[#0f3b8e] text-white p-5 pt-6 relative">
                    <div className="absolute top-0 left-0 w-full h-2 bg-white/10" style={{ backgroundImage: 'radial-gradient(circle at 10px 0, transparent 10px, #0f3b8e 11px)', backgroundSize: '20px 20px', backgroundRepeat: 'repeat-x' }}></div>
                    
                    <div className="flex justify-between items-start">
                        <h2 className="text-2xl font-black mt-2">Boleta N° {venta.id_venta}</h2>
                        <div className="flex flex-col items-end gap-2">
                            <button 
                                onClick={onClose}
                                className="text-white/70 hover:text-white transition-colors -mr-1 -mt-1"
                            >
                                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                            </button>
                            <span className="bg-white/20 px-2.5 py-1 rounded text-sm font-bold">
                                {venta.metodo_pago}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body Info */}
                <div className="bg-blue-50/50 px-5 py-4 border-b border-gray-100 grid grid-cols-2 gap-4">
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Fecha</p>
                        <p className="text-sm font-bold text-gray-800">{fechaSafe ? new Date(fechaSafe).toLocaleDateString('es-CL') : '--'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Hora</p>
                        <p className="text-sm font-bold text-gray-800">{fechaSafe ? new Date(fechaSafe).toLocaleTimeString('es-CL', {hour: '2-digit', minute:'2-digit'}) : '--'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Cajero</p>
                        <p className="text-sm font-bold text-gray-800 truncate">{venta.usuario?.name || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-xs text-gray-500 font-semibold uppercase">Turno ID</p>
                        <p className="text-sm font-bold text-gray-800">#{venta.id_turno}</p>
                    </div>
                </div>

                {/* Table of Products */}
                <div className="flex-1 overflow-auto p-5">
                    <h3 className="text-base font-bold text-gray-800 mb-3">Productos Vendidos</h3>
                    
                    {venta.detalles && venta.detalles.length > 0 ? (
                        <div className="border border-gray-200 rounded-xl overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-200">
                                        <th className="py-2.5 px-3 text-xs font-bold text-gray-500 uppercase">Prod.</th>
                                        <th className="py-2.5 px-2 text-xs font-bold text-gray-500 uppercase text-center">Cant.</th>
                                        <th className="py-2.5 px-3 text-xs font-bold text-gray-500 uppercase text-right">Subtotal</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {venta.detalles.map((detalle) => (
                                        <tr key={detalle.id_detalle_venta} className="hover:bg-gray-50">
                                            <td className="py-3 px-3">
                                                <p className="font-semibold text-gray-800 text-sm leading-tight">{detalle.producto?.nombre_comercial || 'Producto desconocido'}</p>
                                                <p className="text-xs text-gray-500 mt-0.5">${Number(detalle.precio_unitario).toLocaleString('es-CL')} c/u</p>
                                                {detalle.descuento > 0 && (
                                                    <span className="text-[10px] font-bold text-white bg-red-500 px-1.5 py-0.5 rounded mt-1 inline-block">
                                                        Desc. ${Number(detalle.descuento).toLocaleString('es-CL')}
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 px-2 text-center font-bold text-gray-700 text-sm">
                                                {detalle.cantidad}
                                            </td>
                                            <td className="py-3 px-3 text-right font-bold text-gray-900 text-sm">
                                                ${Number(detalle.subtotal).toLocaleString('es-CL')}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    ) : (
                        <div className="text-center py-6 text-gray-400">
                            No se encontraron detalles para esta venta.
                        </div>
                    )}
                </div>

                {/* Footer Payment Details */}
                <div className="bg-gray-50 p-5 border-t border-gray-200">
                    <div className="flex justify-between items-end gap-2">
                        <div className="flex flex-col gap-2">
                            {isEfectivo && (
                                <>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase leading-none">Pago Recibido</p>
                                        <p className="text-sm font-bold text-gray-800 mt-1">${Number(venta.pago_recibido).toLocaleString('es-CL')}</p>
                                    </div>
                                    <div>
                                        <p className="text-xs text-gray-500 font-semibold uppercase leading-none">Vuelto</p>
                                        <p className="text-sm font-bold text-gray-800 mt-1">${Number(venta.vuelto).toLocaleString('es-CL')}</p>
                                    </div>
                                </>
                            )}
                            {venta.folio_receta && (
                                <div>
                                    <p className="text-xs text-gray-500 font-semibold uppercase leading-none">Folio Receta</p>
                                    <p className="text-sm font-bold text-amber-600 bg-amber-100 px-2 py-0.5 rounded mt-1 inline-block">{venta.folio_receta}</p>
                                </div>
                            )}
                        </div>
                        
                        <div className="text-right">
                            <p className="text-xs text-gray-500 font-semibold uppercase">Total a Pagar</p>
                            <p className="text-3xl font-black text-[#0f3b8e] mt-1">${Number(venta.total_venta).toLocaleString('es-CL')}</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
