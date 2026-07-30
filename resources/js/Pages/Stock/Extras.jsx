import React, { useState } from 'react';
import { useForm, Head } from '@inertiajs/react';
import axios from 'axios';
import PosLayout from '@/Layouts/PosLayout'; 

export default function Extras({ auth }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        id_producto: '',
        codigo_barras: '',
        numero_lote: '',
        tipo_movimiento: 'salida',
        motivo: 'merma',
        cantidad: '',
        observaciones: ''
    });

    const [productoEncontrado, setProductoEncontrado] = useState(null);
    const [lotes, setLotes] = useState([]);
    const [buscando, setBuscando] = useState(false);
    const [notificacion, setNotificacion] = useState(null);

    const buscarProducto = async (codigo) => {
        if (!codigo) return;
        
        setBuscando(true);
        try {
            const response = await axios.get(`/stock/buscar-producto/${codigo}`);
            const producto = response.data.producto;

            const lotesDelProducto = producto.lotesInventario || producto.lotes || [];
            setProductoEncontrado(producto);
            setLotes(lotesDelProducto);
            
            setData(data => ({
            ...data,
            
            id_producto: producto.id_producto, 
            numero_lote: lotesDelProducto.length === 1 ? lotesDelProducto[0].numero_lote : ''
        }));
            
        } catch (error) {
            console.error("Error devuelto por Laravel:", error.response?.data || error.message);
            alert('Producto no encontrado o código incorrecto');
            setProductoEncontrado(null);
            setLotes([]);
            setData('id_producto', '');
        } finally {
            setBuscando(false);
        }
    };

    const mostrarNotificacion = (tipo, mensaje) => {
        setNotificacion({ tipo, mensaje });
        setTimeout(() => {
            setNotificacion(null);
        }, 4000);
    };

    const handleSubmit = (e) => {
        e.preventDefault();

        // 1. VALIDACIÓN FRONTEND: Revisamos qué campos faltan
        const camposFaltantes = [];
        
        if (!data.codigo_barras || !data.id_producto) camposFaltantes.push('Producto');
        if (!data.numero_lote) camposFaltantes.push('Lote');
        if (!data.tipo_movimiento) camposFaltantes.push('Tipo de Movimiento');
        if (!data.motivo) camposFaltantes.push('Motivo');
        if (!data.cantidad || isNaN(data.cantidad) || Number(data.cantidad) <= 0) camposFaltantes.push('Cantidad (debe ser mayor a 0)');

        // Si hay campos faltantes, mostramos la notificación y detenemos el envío
        if (camposFaltantes.length > 0) {
            mostrarNotificacion(
                'error', 
                `Faltan rellenar los siguientes campos: ${camposFaltantes.join(', ')}.`
            );
            return; // Detiene la ejecución aquí
        }

        // 2. ENVÍO AL BACKEND (Si pasa la validación)
        post(route('stock.movimientos.store'), { // Asegúrate de que la ruta sea correcta según tu web.php
            onSuccess: () => {
                reset();
                setProductoEncontrado(null);
                setLotes([]);
                // Reemplazamos el alert por tu notificación de éxito
                mostrarNotificacion('exito', 'Movimiento registrado correctamente en el inventario');
            },
            onError: (erroresDeLaravel) => {
                // Si Laravel devuelve errores (ej. stock insuficiente)
                const mensajeError = erroresDeLaravel.error || 'Ocurrió un error al guardar. Verifica los datos.';
                mostrarNotificacion('error', mensajeError);
            }
        });
    };

    return (
        <PosLayout auth={auth} titulo="Movimientos Extra">
            <Head title="Movimientos Extra - Farmaquinta" />

            {/* NOTIFICACIÓN FLOTANTE */}
            {notificacion && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl font-bold transition-all duration-300 animate-fade-in-down flex items-center gap-3 ${
                    notificacion.tipo === 'error' 
                        ? 'bg-red-50 text-red-600 border-l-4 border-red-500' 
                        : notificacion.tipo === 'exito'
                            ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                            : 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500'
                }`}>
                    {notificacion.tipo === 'exito' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                        </svg>
                    )}
                    {notificacion.tipo === 'error' && (
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"></path>
                        </svg>
                    )}
                    <span>{notificacion.mensaje}</span>
                </div>
            )}

            {/* CONTENEDOR PRINCIPAL */}
            
            <div className="flex-1 p-8 overflow-y-auto">
                
                <div className="max-w-4xl mx-auto">
                    {/* ENCABEZADO DE LA VISTA */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-800">Registrar Movimiento Extra</h1>
                        <p className="text-sm text-gray-500 mt-1">Ajustes manuales de inventario (mermas, vencimientos, etc.)</p>
                    </div>

                    {/* TARJETA DEL FORMULARIO */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
                        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
                            
                            {/* --- SECCIÓN 1: PRODUCTO Y LOTE --- */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-[#3b82f6] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">1</span>
                                    Identificación del Producto
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                    
                                    {/* INPUT ESCÁNER */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                                        <div className="relative">
                                            <input
                                                type="text"
                                                autoFocus
                                                placeholder="Escanee o escriba y presione Enter..."
                                                className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm transition-colors"
                                                value={data.codigo_barras}
                                                onChange={(e) => setData('codigo_barras', e.target.value)}
                                                onKeyDown={(e) => {
                                                    if (e.key === 'Enter') {
                                                        e.preventDefault(); // Evita que el formulario se envíe
                                                        buscarProducto(data.codigo_barras);
                                                    }
                                                }}
                                            />
                                            {buscando && <span className="absolute right-3 top-2 text-xs text-blue-500">Buscando...</span>}
                                        </div>
                                        
                                        {/* Feedback visual del producto encontrado */}
                                        {productoEncontrado && (
                                            <p className="mt-2 text-xs text-green-600 font-semibold">
                                                {productoEncontrado.nombre_comercial}  
                                            </p>
                                        )}
                                        {errors.id_producto && <span className="text-red-500 text-xs mt-1 block">El producto es obligatorio.</span>}
                                    </div>

                                    {/* SELECTOR DE LOTES DINÁMICO */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Seleccione el Lote</label>
                                        <select
                                            disabled={!productoEncontrado || lotes.length === 0}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm bg-white disabled:bg-gray-100 transition-colors"
                                            value={data.numero_lote}
                                            onChange={(e) => setData('numero_lote', e.target.value)}
                                        >
                                            <option value="">
                                                {!productoEncontrado 
                                                    ? 'Primero escanee un producto' 
                                                    : lotes.length === 0 
                                                        ? 'No hay lotes disponibles' 
                                                        : 'Seleccione un lote...'}
                                            </option>
                                            
                                            {lotes.map((lote) => (
                                                <option key={lote.id_lote || lote.id} value={lote.numero_lote}>
                                                    {lote.numero_lote} (Stock: {lote.cantidad_disponible} | Vence: {lote.fecha_caducidad || 'N/A'})
                                                </option>
                                            ))}
                                        </select>
                                        {errors.numero_lote && <span className="text-red-500 text-xs mt-1 block">{errors.numero_lote}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* --- SECCIÓN 2: DETALLES DEL MOVIMIENTO --- */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                                    <span className="bg-[#3b82f6] text-white w-6 h-6 rounded-full flex items-center justify-center text-sm">2</span>
                                    Detalles de la Operación
                                </h3>
                                
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50/50 p-4 rounded-lg border border-gray-100">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de Movimiento</label>
                                        <select
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm bg-white transition-colors"
                                            value={data.tipo_movimiento}
                                            onChange={(e) => {
                                                const nuevoTipo = e.target.value;
                                                setData(data => ({
                                                    ...data,
                                                    tipo_movimiento: nuevoTipo,
                                                    motivo: nuevoTipo === 'salida' ? 'merma' : 'no_estaba_xml'
                                                }));
                                            }}
                                        >
                                            <option value="salida">Salida (Resta Stock)</option>
                                            <option value="entrada">Entrada (Suma Stock)</option>
                                        </select>
                                        {errors.tipo_movimiento && <span className="text-red-500 text-xs mt-1 block">{errors.tipo_movimiento}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Motivo</label>
                                        <select
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm bg-white transition-colors"
                                            value={data.motivo}
                                            onChange={(e) => setData('motivo', e.target.value)}
                                        >
                                            {data.tipo_movimiento === 'salida' ? (
                                                <>
                                                    <option value="merma">Merma</option>
                                                    <option value="vencimiento">Vencimiento</option>
                                                    <option value="uso_interno">Uso Interno</option>
                                                    <option value="ajuste_inventario">Ajuste de Inventario (Salida)</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="no_estaba_xml">No estaba en el XML</option>
                                                    <option value="ingreso_externo">Ingreso Externo</option>
                                                    <option value="ajuste_inventario">Ajuste de Inventario (Entrada)</option>
                                                </>
                                            )}
                                        </select>
                                        {errors.motivo && <span className="text-red-500 text-xs mt-1 block">{errors.motivo}</span>}
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Cantidad</label>
                                        <input
                                            type="number"
                                            min="1"
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm transition-colors"
                                            value={data.cantidad}
                                            onChange={(e) => setData('cantidad', e.target.value)}
                                        />
                                        {errors.cantidad && <span className="text-red-500 text-xs mt-1 block">{errors.cantidad}</span>}
                                    </div>
                                    
                                    <div className="md:col-span-3 mt-2">
                                        <label className="block text-sm font-medium text-gray-700 mb-1">Observaciones (Opcional)</label>
                                        <textarea
                                            rows="2"
                                            maxLength={50}
                                            className="block w-full rounded-lg border-gray-300 shadow-sm focus:border-[#3b82f6] focus:ring-[#3b82f6] sm:text-sm transition-colors"
                                            placeholder="Detalla qué pasó exactamente..."
                                            value={data.observaciones}
                                            onChange={(e) => setData('observaciones', e.target.value)}
                                        />
                                        {errors.observaciones && <span className="text-red-500 text-xs mt-1 block">{errors.observaciones}</span>}
                                    </div>
                                </div>
                            </div>

                            {/* --- SECCIÓN 3: BOTONES --- */}
                            <div className="flex items-center justify-end gap-4 pt-4 border-t border-gray-100">
                                <button
                                    type="button"
                                    onClick={() => reset()}
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] transition-colors"
                                >
                                    Limpiar
                                </button>
                                <button
                                    type="submit"
                                    disabled={processing}
                                    className="px-6 py-2 text-sm font-medium text-white bg-[#3b82f6] border border-transparent rounded-lg shadow-sm hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#3b82f6] disabled:opacity-50 transition-colors"
                                >
                                    {processing ? 'Guardando...' : 'Confirmar Movimiento'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </PosLayout>
    );
}