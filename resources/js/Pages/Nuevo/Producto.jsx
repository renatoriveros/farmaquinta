import React, { useState } from 'react';
import PosLayout from '@/Layouts/PosLayout';
import { usePage, useForm } from '@inertiajs/react';

export default function Producto({ categorias = [] }) {
    // Extraemos auth de las props globales
    const { auth } = usePage().props;
    
    const [notificacion, setNotificacion] = useState(null);
    // Inicializamos useForm de Inertia con los campos
    const { data, setData, post, processing, errors, reset } = useForm({
        id_categoria: '',
        codigo_barras: '',
        nombre_comercial: '',
        principio_activo: '',
        laboratorio: '',
        concentracion: '',
        presentacion: '',
        requiere_receta: false, 
        precio_venta: '',
        stock_minimo: 10, 
    });

    //  Función para enviar el formulario, cuando apreto el submit del formulario
    //desencadena esta funcion
    const handleSubmit = (e) => {
        e.preventDefault();
        // puedo llamarla asi ya que tenemos 
        post(route('ingreso.nuevo.producto'), {
            onSuccess: () => {

                setNotificacion({
                    tipo: 'exito',
                    mensaje: 'Producto creado exitosamente'
                });
                reset();
                setTimeout(() => {
                    setNotificacion(null);
                }, 3500);
            }
            
        });
    };

    return (
        <PosLayout auth={auth} user={auth?.user}>
            <div className="p-6 max-w-7xl mx-auto">
                
                {/* 1. Alerta de Notificación: Se dibuja aquí, pero por sus clases 'fixed' aparecerá en la esquina superior derecha */}
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
                        <span>{notificacion.mensaje}</span>
                    </div>
                )}
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-[#0f3b8e]">Registrar Nuevo Producto</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">{/*el formulario se envia cuando hayun submit en el boton que yo diga que es el submit */}
                        
                        {/* Contenedor Grid para organizar los inputs en 3 columnas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* Código de Barras */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Código de Barras</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.codigo_barras}
                                    onChange={e => setData('codigo_barras', e.target.value)}
                                />
                                {errors.codigo_barras && <span className="text-red-500 text-xs mt-1">{errors.codigo_barras}</span>}
                            </div>

                            {/* Categoría */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Categoría</label>
                                <select
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.id_categoria}
                                    onChange={e => setData('id_categoria', e.target.value)}
                                >
                                    <option value="">Seleccione una categoría</option>
                                    {/* Iteramos las categorías que deben venir desde el Controlador */}
                                    {categorias.map((cat) => (
                                        <option key={cat.id_categoria} value={cat.id_categoria}>{cat.nombre}</option>
                                    ))}
                                </select>
                                {errors.id_categoria && <span className="text-red-500 text-xs mt-1">{errors.id_categoria}</span>}
                            </div>

                            {/* Nombre Comercial */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Comercial</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.nombre_comercial}
                                    onChange={e => setData('nombre_comercial', e.target.value)}
                                />
                                {errors.nombre_comercial && <span className="text-red-500 text-xs mt-1">{errors.nombre_comercial}</span>}
                            </div>

                            {/* Principio Activo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Principio Activo</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.principio_activo}
                                    onChange={e => setData('principio_activo', e.target.value)}
                                />
                                {errors.principio_activo && <span className="text-red-500 text-xs mt-1">{errors.principio_activo}</span>}
                            </div>

                            {/* Laboratorio */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Laboratorio</label>
                                <input
                                    type="text"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.laboratorio}
                                    onChange={e => setData('laboratorio', e.target.value)}
                                />
                                {errors.laboratorio && <span className="text-red-500 text-xs mt-1">{errors.laboratorio}</span>}
                            </div>

                            {/* Concentración */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Concentración</label>
                                <input
                                    type="text"
                                    placeholder="Ej: 1450 ppm F, 500mg"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.concentracion}
                                    onChange={e => setData('concentracion', e.target.value)}
                                />
                                {errors.concentracion && <span className="text-red-500 text-xs mt-1">{errors.concentracion}</span>}
                            </div>

                            {/* Presentación */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Presentación</label>
                                <input
                                    type="text"
                                    placeholder="Ej: Tubo 110 gr, Frasco 250 ml"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.presentacion}
                                    onChange={e => setData('presentacion', e.target.value)}
                                />
                                {errors.presentacion && <span className="text-red-500 text-xs mt-1">{errors.presentacion}</span>}
                            </div>

                            {/* Precio de Venta */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Precio de Venta</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">$</span>
                                    <input
                                        type="number"
                                        min="0"
                                        step="0.01"
                                        className="w-full pl-8 border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                        value={data.precio_venta}
                                        onChange={e => setData('precio_venta', e.target.value)}
                                    />
                                </div>
                                {errors.precio_venta && <span className="text-red-500 text-xs mt-1">{errors.precio_venta}</span>}
                            </div>

                            {/* Stock Mínimo */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Stock Mínimo</label>
                                <input
                                    type="number"
                                    min="0"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.stock_minimo}
                                    onChange={e => setData('stock_minimo', e.target.value)}
                                />
                                {errors.stock_minimo && <span className="text-red-500 text-xs mt-1">{errors.stock_minimo}</span>}
                            </div>
                        </div>

                        {/* Fila separada para el Checkbox y el Botón de envío */}
                        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-100">
                            
                            {/* Requiere Receta (Checkbox) */}
                            <div className="flex items-center mb-4 md:mb-0">
                                <input
                                    id="requiere_receta"
                                    type="checkbox"
                                    className="h-4 w-4 text-[#0f3b8e] focus:ring-[#0f3b8e] border-gray-300 rounded"
                                    checked={data.requiere_receta}
                                    onChange={e => setData('requiere_receta', e.target.checked)}
                                />
                                <label htmlFor="requiere_receta" className="ml-2 block text-sm text-gray-900 font-medium">
                                    Este producto requiere receta médica
                                </label>
                            </div>

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-[#0f3b8e] text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 transition-colors w-full md:w-auto"
                            >
                                {processing ? 'Guardando...' : 'Guardar Producto'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </PosLayout>
    );
}