import React, { useState, useEffect, useRef } from 'react';
import PosLayout from '@/Layouts/PosLayout';
import { usePage, router } from '@inertiajs/react'; // Añadimos router

export default function ActivarProducto({productos, filtroActual}) {
    // Extraemos auth de las props globales
    const { auth } = usePage().props;
    const [notificacion, setNotificacion] = useState(null);

    // El estado del buscador inicia con lo que Laravel nos envíe (por si recargan la página)
    const [busqueda, setBusqueda] = useState(filtroActual || '')
    // Referencia para evitar que busque la primera vez que carga la pantalla
    const isFirstRender = useRef(true);
   
    // --- EL CEREBRO DEL BUSCADOR (DEBOUNCE) ---
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }

        // Creamos un temporizador de 300 milisegundos
        const delayDebounceFn = setTimeout(() => {
            // Le decimos a Inertia que recargue la ruta enviando la palabra a buscar
            router.get(
                route('activar-producto'), 
                { buscar: busqueda }, 
                {
                    preserveState: true, // No reinicies mis variables de estado de React
                    preserveScroll: true, // No me subas la pantalla de golpe
                    replace: true // No llenes el historial del navegador con cada letra
                }
            );
        }, 300); 

        // Si el usuario sigue escribiendo antes de los 300ms, borramos el temporizador anterior
        return () => clearTimeout(delayDebounceFn);
        
    }, [busqueda]);

    // Función para activar/desactivar el producto
    const handleToggle = (id) => {
        router.post(
            // Le pasamos el 'id' a Ziggy, empaquetado para que sepa que corresponde a 'id_producto'
            route('nuevo.producto.toggle', { id_producto: id }),
            {}, // No enviamos datos extra, solo la petición
            {
                preserveScroll: true, // Evita que la pantalla salte hacia arriba al hacer clic
                preserveState: true, // Mantiene el texto que tengas escrito en el buscador
                onSuccess: () => {
                    // Aprovechamos tu sistema de notificaciones para dar feedback
                    setNotificacion({ 
                        tipo: 'exito', 
                        mensaje: 'Estado del producto actualizado correctamente.' 
                    });
                    
                    // Ocultamos la alerta después de 3 segundos
                    setTimeout(() => setNotificacion(null), 3000);
                },
                onError: () => {
                    setNotificacion({ 
                        tipo: 'error', 
                        mensaje: 'Hubo un problema al actualizar el producto.' 
                    });
                    setTimeout(() => setNotificacion(null), 3000);
                }
            }
        );
    };
    
   

    return (
        <PosLayout auth={auth} user={auth?.user} titulo="Activar o Desactivar Producto">
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
               

                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
                    {/* SECCIÓN 1: EL BUSCADOR */}
                    <div className="relative max-w-2xl mx-auto">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                            <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </div>
                        <input
                            type="text"
                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-[#0f3b8e] focus:border-[#0f3b8e] text-lg"
                            placeholder="Buscar por nombre comercial o escanear código de barras..."
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                        />
                    </div>
                </div>

                {/* SECCIÓN 2: LA BAJADA CON LAS TARJETAS */}
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {/* Hacemos el mapeo con la variable 'productos' que viene de Laravel */}
                    {productos.length > 0 ? (
                        productos.map((producto) => (
                            <div 
                                key={producto.id_producto} 
                                className={`p-5 rounded-xl border transition-all duration-200 ${
                                    producto.activo ? 'bg-white border-gray-200 shadow-sm hover:shadow-md' : 'bg-gray-50 border-gray-200 opacity-75'
                                }`}
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <h3 className={`text-lg text-sm font-bold ${producto.activo ? 'text-gray-900' : 'text-gray-500 line-through'}`}>
                                            {producto.nombre_comercial}
                                        </h3>
                                        <p className="text-sm text-gray-500 mt-1">
                                            Cód: {producto.codigo_barras}
                                        </p>
                                        
                                    </div>
                                    
                                    {/* EL INTERRUPTOR (TOGGLE) PARA ACTIVAR/DESACTIVAR */}
                                    <label className="relative inline-flex items-center cursor-pointer">
                                        <input 
                                            type="checkbox" 
                                            className="sr-only peer" 
                                            checked={producto.activo}
                                            onChange={() => handleToggle(producto.id_producto)}
                                        />
                                        <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[#0f3b8e]"></div>
                                    </label>
                                </div>
                            </div>
                        ))
                    ) : (
                        // Mensaje amigable si la búsqueda no arroja resultados
                        <div className="col-span-full text-center py-10 text-gray-500">
                            No se encontraron productos con ese nombre o código.
                        </div>
                    )}
                </div>

            </div>
        </PosLayout>
    );
}