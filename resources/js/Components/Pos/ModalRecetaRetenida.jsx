import { useState, useEffect } from 'react';

export default function ModalRecetaRetenida({ isOpen, onClose, onConfirm }) {
    // El estado del folio vive aquí, limpiando el componente padre
    const [folio, setFolio] = useState('');

    // Cada vez que se abre el modal, limpiamos el input
    useEffect(() => {
        if (isOpen) {
            setFolio('');
        }
    }, [isOpen]);

    if (!isOpen) return null; // Si no está abierto, no renderiza nada

    return (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm transition-opacity">
            <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md transform transition-all animate-fade-in-down">
                <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center shadow-inner">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                        </svg>
                    </div>
                    <h3 className="text-xl font-black text-gray-800">
                        Receta Médica Requerida
                    </h3>
                </div>
                
                <p className="text-sm text-gray-600 mb-6">
                    El carrito contiene medicamentos que exigen receta médica retenida. Por favor, ingrese el folio para autorizar la venta.
                </p>

                <div className="mb-6">
                    <label className="block text-sm font-bold text-gray-700 mb-2">Folio de Receta</label>
                    <input
                        type="text"
                        value={folio}
                        onChange={(e) => setFolio(e.target.value)}
                        className="w-full border-gray-300 rounded-xl shadow-sm focus:ring-blue-500 focus:border-blue-500 p-3 border text-lg outline-none transition-shadow"
                        placeholder="Ej. 987654321"
                        autoFocus
                    />
                </div>

                <div className="flex justify-end gap-3 mt-2">
                    <button
                        onClick={onClose}
                        className="px-5 py-2.5 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-bold transition-colors"
                    >
                        Cancelar
                    </button>
                    <button
                        // Al confirmar, enviamos el folio escrito de vuelta al padre
                        onClick={() => onConfirm(folio)}
                        disabled={!folio.trim()}
                        className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-bold transition-colors shadow-md flex items-center gap-2"
                    >
                        Confirmar y Cobrar
                    </button>
                </div>
            </div>
        </div>
    );
}