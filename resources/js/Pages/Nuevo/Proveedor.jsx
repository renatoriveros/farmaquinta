import React, { useState } from 'react';
import PosLayout from '@/Layouts/PosLayout';
import { usePage, useForm } from '@inertiajs/react';

export default function Proveedor({}) {
    // Extraemos auth de las props globales
    const { auth } = usePage().props;
    
    const [notificacion, setNotificacion] = useState(null);
    // Inicializamos useForm de Inertia con los campos
    const { data, setData, post, processing, errors, reset } = useForm({
        identificacion_fiscal: '',
        nombre_empresa: '',
        nombre_contacto: '',
        telefono: '',
        email: '',
        dias_credito: '', 
    });

    //  Función para enviar el formulario, cuando apreto el submit del formulario
    //desencadena esta funcion
    const handleSubmit = (e) => {
        e.preventDefault();
        // puedo llamarla asi ya que tenemos 
        post(route('ingreso.nuevo.proveedor'), {
            onSuccess: () => {

                setNotificacion({
                    tipo: 'exito',
                    mensaje: 'Proveedor creado exitosamente'
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
                    <h1 className="text-2xl font-bold text-[#0f3b8e]">Registrar Nuevo Proveedor</h1>
                </div>

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <form onSubmit={handleSubmit} className="space-y-6">{/*el formulario se envia cuando hayun submit en el boton que yo diga que es el submit */}
                        
                        {/* Contenedor Grid para organizar los inputs en 3 columnas */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            
                            {/* Nombre Del Proveedor */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre Empresa</label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.nombre_empresa}
                                    onChange={e => setData('nombre_empresa', e.target.value)}
                                />
                                {errors.nombre_empresa && <span className="text-red-500 text-xs mt-1">{errors.nombre_empresa}</span>}
                            </div>

                            {/* RUT */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Rut empresa</label>
                                <input
                                    type="text"
                                    placeholder="Sin puntos y con Guion"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.identificacion_fiscal}
                                    onChange={e => setData('identificacion_fiscal', e.target.value)}
                                />
                                {errors.identificacion_fiscal && <span className="text-red-500 text-xs mt-1">{errors.identificacion_fiscal}</span>}
                            </div>

                            {/* Nombre Contacto */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Nombre de Contacto</label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    placeholder='Contacto Directo con la empresa'
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.nombre_contacto}
                                    onChange={e => setData('nombre_contacto', e.target.value)}
                                />
                                {errors.nombre_contacto && <span className="text-red-500 text-xs mt-1">{errors.nombre_contacto}</span>}
                            </div>

                            {/* telefono */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Telefono</label>
                                <input
                                    type="text"
                                    placeholder='Ej: 9 12345678'
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.laboratorio}
                                    onChange={e => setData('telefono', e.target.value)}
                                />
                                {errors.telefono && <span className="text-red-500 text-xs mt-1">{errors.telefono}</span>}
                            </div>

                            {/* email */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                <input
                                    type="text"
                                    maxLength={50}
                                    placeholder="Ej: empresa_proveedor@gmail.com "
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.concentracion}
                                    onChange={e => setData('email', e.target.value)}
                                />
                                {errors.email && <span className="text-red-500 text-xs mt-1">{errors.email}</span>}
                            </div>

                            {/* dias_credito */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Días de Credito</label>
                                <input
                                    type="text"
                                    placeholder="Ej: ejemplo dias de credito?"
                                    className="w-full border-gray-300 rounded-lg shadow-sm focus:border-[#0f3b8e] focus:ring focus:ring-[#0f3b8e] focus:ring-opacity-50"
                                    value={data.dias_credito}
                                    onChange={e => setData('dias_credito', e.target.value)}
                                />
                                {errors.dias_credito && <span className="text-red-500 text-xs mt-1">{errors.dias_credito}</span>}
                            </div>
                        </div>

                        {/* Fila separada para el Checkbox y el Botón de envío */}
                        <div className="flex flex-col md:flex-row justify-between items-center pt-4 border-t border-gray-100">
                            

                            <button
                                type="submit"
                                disabled={processing}
                                className="px-6 py-2 bg-[#0f3b8e] text-white font-semibold rounded-lg shadow-md hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-75 disabled:opacity-50 transition-colors w-full md:w-auto"
                            >
                                {processing ? 'Guardando...' : 'Registrar Proveedor'}
                            </button>
                        </div>

                    </form>
                </div>
            </div>
        </PosLayout>
    );
}