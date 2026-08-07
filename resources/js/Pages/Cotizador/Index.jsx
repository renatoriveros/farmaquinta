import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import PosLayout from '@/Layouts/PosLayout';
import { Head } from '@inertiajs/react';
import CarritoUnificado from '@/Components/CarritoUnificado';

export default function CotizadorIndex({ auth, proveedores }) {
    const [busqueda, setBusqueda] = useState('');
    const [cargando, setCargando] = useState(false);
    
    // Toggle para sumar IVA a precios netos (Ñuñoa y Toledo)
    const [incluirIva, setIncluirIva] = useState(true);

    // Resultados simulados para mostrar la UI
    const [resultados, setResultados] = useState([]);
    
    // Carrito de compras unificado
    const [carrito, setCarrito] = useState(() => {
        const guardado = localStorage.getItem('cotizador_carrito');
        return guardado ? JSON.parse(guardado) : [];
    });
    const [enviando, setEnviando] = useState(false);

    // Mapa de colores estáticos para Tailwind JIT
    const colorMap = {
        sky: { bgLight: 'bg-sky-50', border: 'border-sky-200', bgHeader: 'bg-sky-400' },
        orange: { bgLight: 'bg-orange-50', border: 'border-orange-200', bgHeader: 'bg-orange-400' },
        lime: { bgLight: 'bg-lime-50', border: 'border-lime-200', bgHeader: 'bg-lime-400' },
        emerald: { bgLight: 'bg-emerald-50', border: 'border-emerald-200', bgHeader: 'bg-emerald-400' },
        purple: { bgLight: 'bg-purple-50', border: 'border-purple-200', bgHeader: 'bg-purple-400' },
        rose: { bgLight: 'bg-rose-50', border: 'border-rose-200', bgHeader: 'bg-rose-400' },
        amber: { bgLight: 'bg-amber-50', border: 'border-amber-200', bgHeader: 'bg-amber-400' }
    };
    
    const bookmarkletRef = useRef(null);

    useEffect(() => {
        if (bookmarkletRef.current) {
            bookmarkletRef.current.href = "javascript:(function(){var c=document.cookie;if(c.includes('extcompany')){window.location.href='http://farmaquinta.test/cotizador/actualizar-cookie?proveedor=midn&cookie='+encodeURIComponent(c);}else{alert('¡Primero debes iniciar sesion en midn.cl!');}})()";
        }
    }, []);

    useEffect(() => {
        localStorage.setItem('cotizador_carrito', JSON.stringify(carrito));
    }, [carrito]);

    const realizarBusquedaSimulada = async (e) => {
        e.preventDefault();
        if (!busqueda.trim() || busqueda.length < 3) return;

        setCargando(true);
        setResultados([]); // Limpiar resultados anteriores
        
        try {
            const response = await axios.get(`/cotizador/buscar?q=${encodeURIComponent(busqueda)}`);
            setResultados(response.data);
        } catch (error) {
            console.error("Error al buscar:", error);
            alert("Ocurrió un error al consultar a los proveedores.");
        } finally {
            setCargando(false);
        }
    };

    const enviarCarritosAB2B = async () => {
        if (carrito.length === 0) return;
        setEnviando(true);
        try {
            const response = await axios.post('/cotizador/enviar-carrito', { carrito });
            if (response.data.success) {
                alert("¡Carritos rellenados con éxito en los B2B!\n\nEstado:\n" + JSON.stringify(response.data.resultados, null, 2));
                // Vaciar carrito luego de enviarlo con éxito
                setCarrito([]);
            } else {
                alert("Error: " + response.data.message);
            }
        } catch (error) {
            console.error("Error al enviar carrito:", error);
            alert("Ocurrió un error al intentar enviar el carrito a los B2B.");
        } finally {
            setEnviando(false);
        }
    };

    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-CL', {
            style: 'currency',
            currency: 'CLP'
        }).format(monto);
    };

    const agregarAlCarrito = (producto, opcion) => {
        setCarrito(prevCarrito => {
            const itemExistente = prevCarrito.find(
                item => item.producto === producto.nombre && item.proveedor === opcion.proveedor
            );

            if (itemExistente) {
                return prevCarrito.map(item =>
                    item.id === itemExistente.id
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }

            const proveedorObj = proveedores.find(p => p.id === opcion.proveedor);
            
            const nuevoItem = {
                id: Date.now() + Math.random(),
                producto: producto.nombre,
                proveedor: opcion.proveedor,
                precio: opcion.precio,
                color: proveedorObj?.color || opcion.color,
                cantidad: 1,
                id_producto_proveedor: opcion.id_producto_proveedor
            };
            
            return [...prevCarrito, nuevoItem];
        });
    };

    const getTotalCarrito = () => carrito.reduce((acc, item) => acc + (item.precio * item.cantidad), 0);
    const getSubtotalProveedor = (proveedorId) => carrito.filter(item => item.proveedor === proveedorId).reduce((acc, item) => acc + (item.precio * item.cantidad), 0);

    return (
        <PosLayout auth={auth} titulo="Cotizador Inteligente B2B">
            <Head title="Cotizador Inteligente" />

            <div className="flex h-[calc(100vh-5rem)]">
                {/* PANEL IZQUIERDO: BÚSQUEDA Y RESULTADOS */}
                <div className="flex-1 flex flex-col bg-gray-50 overflow-hidden">
                    
                    {/* Header de Búsqueda */}
                    <div className="bg-white shadow-sm p-4 z-10 border-b border-gray-200 shrink-0">
                        {/* Bookmarklet de Renovación Rápida */}
                        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-3 mb-4 rounded-r-lg flex items-center justify-between max-w-4xl mx-auto shadow-sm">
                            <div>
                                <h3 className="font-bold text-yellow-800 text-sm">Refresco Rápido de Sesión (Ñuñoa)</h3>
                                <p className="text-xs text-yellow-700 mt-1">Arrastra el botón azul a tu barra de marcadores. Si Ñuñoa marca $0, loguéate en <a href="https://www.midn.cl" target="_blank" className="underline font-semibold">midn.cl</a> y haz click en tu marcador.</p>
                            </div>
                            <a 
                                ref={bookmarkletRef}
                                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-1.5 px-3 rounded text-sm shadow cursor-grab active:cursor-grabbing transition-colors whitespace-nowrap ml-4"
                                title="Arrastra esto a tu barra de marcadores"
                            >
                                Refrescar Ñuñoa 🔄
                            </a>
                        </div>

                        <form onSubmit={realizarBusquedaSimulada} className="flex gap-3 max-w-4xl mx-auto">
                            <div className="relative flex-1">
                                <input
                                    type="text"
                                    value={busqueda}
                                    onChange={(e) => setBusqueda(e.target.value)}
                                    className="block w-full pl-4 pr-8 py-3 bg-gray-50 border-gray-300 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-200 rounded-lg text-lg font-medium transition-all shadow-inner"
                                    placeholder="Busque el producto a cotizar por nombre o SKU..."
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={cargando}
                                className={`px-6 py-3 rounded-lg text-white font-bold text-lg flex items-center gap-2 transition-all shadow-sm ${
                                    cargando ? 'bg-gray-400' : 'bg-blue-600 hover:bg-blue-700 hover:shadow-md'
                                }`}
                            >
                                {cargando ? (
                                    <>
                                        <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                    </>
                                ) : (
                                    <>
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    </>
                                )}
                            </button>
                        </form>
                        
                        <div className="flex justify-center mt-3">
                            <label className="flex items-center gap-2 cursor-pointer bg-gray-100 px-3 py-1.5 rounded-full border border-gray-200 shadow-sm hover:bg-gray-200 transition-colors">
                                <input 
                                    type="checkbox" 
                                    className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4"
                                    checked={incluirIva}
                                    onChange={(e) => setIncluirIva(e.target.checked)}
                                />
                                <span className="text-sm font-bold text-gray-700 select-none">
                                    Sumar +19% IVA a precios netos (Ñuñoa y Toledo)
                                </span>
                            </label>
                        </div>
                    </div>

                    {/* Resultados Multicolumna */}
                    <div className="flex-1 overflow-hidden">
                        <div className="grid grid-cols-3 h-full p-4 gap-4">
                            {!cargando && busqueda && resultados.length === 0 && (
                                <div className="col-span-3 flex flex-col items-center justify-center py-20 text-gray-400">
                                    <svg className="w-16 h-16 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                                    <p className="text-xl font-medium text-gray-500">No se encontraron resultados para "{busqueda}"</p>
                                </div>
                            )}

                            {resultados.length > 0 && proveedores.map(p => {
                                // Obtener los productos que tengan opción para este proveedor
                                const items = [];
                                resultados.forEach(prod => {
                                    const opcion = prod.opciones.find(o => o.proveedor === p.id);
                                    if (opcion) {
                                        items.push({ producto: prod, opcion });
                                    }
                                });

                                const colores = colorMap[p.color] || colorMap['sky']; // fallback

                                return (
                                    <div key={p.id} className={`flex flex-col ${colores.bgLight} rounded-t-lg shadow-sm border ${colores.border} h-full overflow-hidden`}>
                                        {/* Header de la columna */}
                                        <div className={`${colores.bgHeader} text-white p-3 flex justify-between items-center rounded-t-lg shadow-sm`}>
                                            <h3 className="font-bold text-lg flex items-center gap-2">
                                                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /></svg>
                                                {p.nombre}
                                                <svg className="w-5 h-5 ml-1 opacity-80" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                                            </h3>
                                            <div className="bg-white text-gray-800 px-3 py-1 rounded-full text-sm font-bold flex items-center gap-1 shadow-inner">
                                                <svg className="w-4 h-4 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>
                                                {formatearDinero(getSubtotalProveedor(p.id))}
                                            </div>
                                        </div>

                                        {/* Lista de productos para este proveedor */}
                                        <div className="flex-1 overflow-y-auto p-3 space-y-3">
                                            {items.map((item, idx) => {
                                                const { producto, opcion } = item;
                                                const sinStock = opcion.stock === '0';
                                                
                                                const precioFinal = (incluirIva && (opcion.proveedor === 'nunoa' || opcion.proveedor === 'toledo'))
                                                    ? opcion.precio * 1.19
                                                    : opcion.precio;

                                                // Averiguar si es el mejor precio general (comparando precios finales)
                                                const opcionesConStock = producto.opciones.filter(o => o.stock !== '0');
                                                const precioMinimo = opcionesConStock.length > 0 
                                                    ? Math.min(...opcionesConStock.map(o => {
                                                        return (incluirIva && (o.proveedor === 'nunoa' || o.proveedor === 'toledo')) ? o.precio * 1.19 : o.precio;
                                                    })) 
                                                    : null;
                                                const esMejorPrecio = precioFinal === precioMinimo && !sinStock;

                                                return (
                                                    <div key={idx} className="bg-white rounded p-4 shadow-sm border border-gray-100 flex items-center justify-between gap-4 group hover:shadow-md hover:border-gray-300 transition-all">
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="font-bold text-sm text-gray-800 leading-tight mb-1">{producto.nombre}</h4>
                                                            <p className="text-[10px] text-gray-400 uppercase">{producto.laboratorio}</p>
                                                            {opcion.vencimiento && (
                                                                <p className="text-xs font-semibold text-red-500 mt-1">Vence en {opcion.vencimiento}</p>
                                                            )}
                                                            {incluirIva && (opcion.proveedor === 'nunoa' || opcion.proveedor === 'toledo') && (
                                                                <p className="text-[10px] text-gray-400 mt-0.5">Neto: {formatearDinero(opcion.precio)}</p>
                                                            )}
                                                        </div>
                                                        <div className="flex flex-col items-end shrink-0">
                                                            {esMejorPrecio && (
                                                                <span className="text-[10px] font-bold text-green-600 bg-green-100 px-1.5 py-0.5 rounded uppercase mb-1">
                                                                    Mejor Precio
                                                                </span>
                                                            )}
                                                            <p className={`text-lg font-black ${sinStock ? 'text-gray-400 line-through' : 'text-gray-900'}`}>
                                                                {formatearDinero(precioFinal)}
                                                            </p>
                                                            <button
                                                                disabled={sinStock}
                                                                onClick={() => agregarAlCarrito(producto, { ...opcion, precio: precioFinal })}
                                                                className={`mt-2 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center justify-center gap-1 transition-colors ${
                                                                    sinStock 
                                                                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                                                                        : 'bg-gray-100 text-gray-700 hover:bg-blue-600 hover:text-white'
                                                                }`}
                                                            >
                                                                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" /></svg>
                                                                Agregar
                                                            </button>
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                            {items.length === 0 && !cargando && (
                                                <div className="text-center text-gray-400 py-10 text-sm font-medium">
                                                    Sin resultados
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* PANEL DERECHO: CARRITO UNIFICADO */}
                <CarritoUnificado 
                    carrito={carrito}
                    setCarrito={setCarrito}
                    proveedores={proveedores}
                    formatearDinero={formatearDinero}
                    enviando={enviando}
                    enviarCarritosAB2B={enviarCarritosAB2B}
                />

            </div>
        </PosLayout>
    );
}
