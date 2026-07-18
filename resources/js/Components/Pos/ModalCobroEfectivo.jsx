import { useState, useEffect } from 'react';

export default function ModalCobroEfectivo({ isOpen, onClose, total, onConfirmarVenta }) {
    
    // ESTADOS AISLADOS DEL MODAL
    const [efectivoRecibido, setEfectivoRecibido] = useState('');
    const [vuelto, setVuelto] = useState(0);
    const [mostrarOpcionesEfectivo, setMostrarOpcionesEfectivo] = useState(false);

    // CALCULAR EL VUELTO
    useEffect(() => {
        const recibido = parseInt(efectivoRecibido) || 0;
        const calculoVuelto = recibido - total;
        setVuelto(calculoVuelto > 0 ? calculoVuelto : 0);
    }, [efectivoRecibido, total]);

    // LIMPIAR DATOS AL CERRAR
    useEffect(() => {
        if (!isOpen) {
            setEfectivoRecibido('');
            setMostrarOpcionesEfectivo(false);
        }
    }, [isOpen]);

    // Si no está abierto, no renderizamos nada
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                
                {/* Cabecera del Modal */}
                <div className="bg-[#0f3b8e] p-4 text-white flex justify-between items-center rounded-t-2xl">
                    <h2 className="text-xl font-bold flex items-center gap-2">
                         Cobrar en Efectivo
                    </h2>
                    <button onClick={onClose} className="text-white/70 hover:text-white text-2xl font-bold">✖</button>
                </div>

                {/* Cuerpo del Modal */}
                <div className="p-6">
                    
                    {/* Resumen a cobrar */}
                    <div className="text-center mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                        <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total a Cobrar</p>
                        <p className="text-4xl font-black text-[#0f3b8e]">${total.toLocaleString('es-CL')}</p>
                    </div>

                    {/* Input de Efectivo Recibido con Lista Desplegable */}
                    <div className="mb-6">
                        <label className="block text-gray-700 font-bold mb-2">Efectivo Recibido del Cliente:</label>
                        <div className="relative">
                            <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-2xl text-gray-400 font-bold">$</span>
                            <input 
                                autoFocus
                                type="number" 
                                min="0"
                                value={efectivoRecibido}
                               onChange={(e) => {
                                    setEfectivoRecibido(e.target.value);
                                    // MEJORA UX: Ocultar la lista apenas el usuario empiece a escribir
                                    if (e.target.value !== '') {
                                        setMostrarOpcionesEfectivo(false);
                                    } else {
                                        setMostrarOpcionesEfectivo(true);
                                    }
                                }}
                                onFocus={() => {
                                    // Solo mostrar opciones si el campo está vacío
                                    if (efectivoRecibido === '') setMostrarOpcionesEfectivo(true);
                                }}
                                onBlur={() => setTimeout(() => setMostrarOpcionesEfectivo(false), 200)}
                                className="w-full text-3xl font-bold text-gray-800 border-2 border-gray-300 rounded-xl py-3 pl-10 pr-4 focus:ring-green-500 focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                placeholder="0"
                            />

                            {/* LISTA DESPLEGABLE DE BILLETES */}
                            {mostrarOpcionesEfectivo && (
                                <ul className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 divide-y divide-gray-100 animate-fade-in-down">
                                    <li 
                                        onMouseDown={() => setEfectivoRecibido(total.toString())}
                                        className="p-4 hover:bg-green-50 cursor-pointer flex justify-between items-center text-lg font-bold text-gray-700 transition-colors rounded-t-xl"
                                    >
                                        <span>Pago Exacto</span>
                                        <span className="text-green-600">${total.toLocaleString('es-CL')}</span>
                                    </li>
                                    {[5000, 10000, 20000].map((billete, index) => (
                                        <li 
                                            key={billete}
                                            onMouseDown={() => setEfectivoRecibido(billete.toString())}
                                            className={`p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-lg font-bold text-gray-700 transition-colors ${index === 2 ? 'rounded-b-xl' : ''}`}
                                        >
                                            <span>Billete de</span>
                                            <span className="text-[#0f3b8e]">${billete.toLocaleString('es-CL')}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </div>

                    {/* Calculadora de Vuelto */}
                    <div className="flex justify-between items-center border-t-2 border-dashed border-gray-200 pt-4 mb-6">
                        <span className="text-gray-600 font-bold text-lg">Vuelto a entregar:</span>
                        <span className={`text-3xl font-black ${parseInt(efectivoRecibido) >= total ? 'text-green-500' : 'text-red-400'}`}>
                            ${vuelto.toLocaleString('es-CL')}
                        </span>
                    </div>

                    {/* Botón de Confirmación */}
                    <button 
                        onClick={() => {
                            onConfirmarVenta(efectivoRecibido, vuelto); // Le pasamos los datos por si los necesita
                        }}
                        disabled={parseInt(efectivoRecibido) < total || !efectivoRecibido}
                        className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-black py-4 rounded-xl shadow-md transition-colors text-xl flex justify-center items-center gap-2"
                    >
                        Confirmar Venta
                    </button>
                </div>
            </div>
        </div>
    );
}