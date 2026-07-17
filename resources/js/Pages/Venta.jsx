import PosLayout from '@/Layouts/PosLayout';
import { useState, useEffect, useRef } from 'react';
import axios from 'axios'; //Sirve para hacer peticiones HTTP a tu backend pero no directamente, sino a el backend de Laravel que luego se comunica con la base de datos. Es más seguro y flexible.

export default function Venta({ auth }) {
    // ESTADOS DEL PUNTO DE VENTA
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState(() => {
        const carritoGuardado = localStorage.getItem('farmaquinta_carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });

    const [descuento, setDescuento] = useState(() => {
        const descuentoGuardado = localStorage.getItem('farmaquinta_descuento');
        return descuentoGuardado ? JSON.parse(descuentoGuardado) : 0;
    });
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    const [mostrarModalCobro, setMostrarModalCobro] = useState(false);
    const [efectivoRecibido, setEfectivoRecibido] = useState('');
    const [vuelto, setVuelto] = useState(0)
    const [mostrarOpcionesEfectivo, setMostrarOpcionesEfectivo] = useState(false);
    const buscadorRef = useRef(null);
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });
    

    useEffect(() => {
        if (buscadorRef.current) {
            buscadorRef.current.focus();
        }
    }, []);

// EFECTO PARA BÚSQUEDA PREDICTIVA (CORREGIDO PARA ESCÁNER)
    useEffect(() => {
        const texto = busqueda.trim();

        // Si tiene menos de 2 letras, no buscamos
        if (texto.length < 2) {
            setSugerencias([]);
            setMostrarSugerencias(false);
            return;
        }
        const esCodigoBarras = /^\d+$/.test(texto) && texto.length >= 6;
        if (esCodigoBarras) {
            setSugerencias([]);
            setMostrarSugerencias(false);
            return;
        }

        // Si es texto normal (letras), esperamos 300ms y buscamos sugerencias
        const timer = setTimeout(async () => {
            try {
                const respuesta = await axios.get(route('api.productos.buscar'), {
                    params: { q: texto }
                });
                setSugerencias(respuesta.data);
                setMostrarSugerencias(true);
            } catch (error) {
                console.error("Error cargando sugerencias:", error);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [busqueda]);
//efecto para calcular el subtotal y total del carrito + descuento
    useEffect(() => {
        // 1. Sumamos los precios del carrito
        const nuevoSubtotal = carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
        setSubtotal(nuevoSubtotal);

        // 2. Restamos el descuento (y evitamos que el total sea menor a cero)
        const calculoTotal = nuevoSubtotal - descuento;
        setTotal(calculoTotal > 0 ? calculoTotal : 0);
        
    }, [carrito, descuento]);

    // EFECTO PARA CALCULAR EL VUELTO
    useEffect(() => {
        const recibido = parseInt(efectivoRecibido) || 0;
        const calculoVuelto = recibido - total;
        // Si el cliente pagó menos del total, el vuelto es 0 (hasta que pague completo)
        setVuelto(calculoVuelto > 0 ? calculoVuelto : 0);
    }, [efectivoRecibido, total]);

    // AUTO-GUARDADO EN LOCALSTORAGE
    useEffect(() => {
        localStorage.setItem('farmaquinta_carrito', JSON.stringify(carrito));
    }, [carrito]);

    useEffect(() => {
        localStorage.setItem('farmaquinta_descuento', JSON.stringify(descuento));
    }, [descuento]);

    // FUNCIÓN PARA ANULAR LA VENTA ACTUAL
    const anularVenta = () => {
        if (confirm("¿Estás seguro de vaciar el carrito y anular esta venta?")) {
            setCarrito([]);
            setDescuento(0);
            setBusqueda('');
            mostrarAlerta("Venta anulada", "error");
            if (buscadorRef.current) buscadorRef.current.focus();
        }
    };
    // FUNCIONES DEL MODAL
    const abrirModalCobro = () => setMostrarModalCobro(true);
    const cerrarModalCobro = () => {
        setMostrarModalCobro(false);
        setEfectivoRecibido(''); 
    };

    
    const confirmarVenta = () => {
        mostrarAlerta("Simulando guardado en Base de Datos...", "success");
        cerrarModalCobro();
        // Aquí limpiaremos el carrito más adelante
    };
 const handleBuscar = async (e) => {
        
        const valorActual = e.target.value.trim();

        if (e.key === 'Enter' && valorActual !== '') {
            e.preventDefault();
            setMostrarSugerencias(false); 
            
            try {
                // Hacemos la consulta a Laravel usando el valor exacto de la pistola
                const respuesta = await axios.get(route('api.productos.buscar'), {
                    params: { q: valorActual } 
                });

                const productosEncontrados = respuesta.data;

                if (productosEncontrados.length === 1) {
                    agregarAlCarrito({
                        id_producto: productosEncontrados[0].id_producto,
                        codigo_barras: productosEncontrados[0].codigo_barras,
                        nombre_comercial: productosEncontrados[0].nombre_comercial,
                        precio_venta: productosEncontrados[0].precio_venta,
                        cantidad: 1,
                    });
                    setBusqueda(''); 
                }  else {
                    
                    mostrarAlerta("Producto no encontrado en el sistema", "error");
                    setBusqueda('');
                }
            } catch (error) {
                console.error("Error buscando el producto:", error);
            }
            
            if (buscadorRef.current) {
                buscadorRef.current.focus();
            }
        }
    };
    const agregarAlCarrito = (productoNuevo) => {
        setCarrito((prevCarrito) => {
            // Buscamos si el producto ya está en el carrito
            const existe = prevCarrito.find(item => item.id_producto === productoNuevo.id_producto);
            
            if (existe) {
                // Si existe, le sumamos 1 a la cantidad
                return prevCarrito.map(item => 
                    item.id_producto === productoNuevo.id_producto 
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            // Si no existe, lo agregamos como nuevo
            return [...prevCarrito, productoNuevo];
        });
    };

    const modificarCantidad = (id, delta) => {
        setCarrito((prev) => prev.map(item => {
            if (item.id_producto === id) {
                const nuevaCantidad = item.cantidad + delta;
                return { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 };
            }
            return item;
        }));
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter(item => item.id_producto !== id));
    };


    //agregamos al carrito desde el desplegable de la sugreencia.
    const agregarDesdeSugerencia = (producto) => {
        agregarAlCarrito({
            id_producto: producto.id_producto,
            codigo_barras: producto.codigo_barras,
            nombre_comercial: producto.nombre_comercial,
            precio_venta: producto.precio_venta,
            cantidad: 1,
        });
        
        // Limpiamos todo para el siguiente cliente/producto
        setBusqueda('');
        setSugerencias([]);
        setMostrarSugerencias(false);
        
        // Devolvemos el foco al buscador por si usa la pistola después
        if (buscadorRef.current) {
            buscadorRef.current.focus();
        }
    };
    // FUNCIÓN PARA MOSTRAR LA ALERTA y no un popup molesto
    const mostrarAlerta = (mensaje, tipo = 'error') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => {
            setNotificacion({ visible: false, mensaje: '', tipo: '' });
        }, 3000);
    };

    return (
        <PosLayout auth={auth} titulo="Punto de Venta">
            {/* NOTIFICACIÓN FLOTANTE */}
            {notificacion.visible && (
                <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl font-bold transition-all duration-300 animate-fade-in-down flex items-center gap-3 ${
                    notificacion.tipo === 'error' 
                        ? 'bg-red-50 text-red-600 border-l-4 border-red-500' 
                        : 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500'
                }`}>
                    <span className="text-xl">
                        {notificacion.tipo === 'error' ? '' : ''}
                    </span>
                    {notificacion.mensaje}
                </div>
            )}
            
            <div className="flex gap-6 h-full">
                
                {/* LADO IZQUIERDO: Buscador y Tabla del Carrito (70% del ancho) */}
                <div className="flex-1 flex flex-col gap-4">
                    
            {/* Buscador / Escáner con Predictivo */}
    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3 relative z-50">
        
        <div className="flex-1 relative">
         <input 
                ref={buscadorRef}
                type="text" 
                placeholder="Escanee el código de barras o escriba el nombre del producto" 
                className="w-full border-none focus:ring-0 text-lg text-gray-700 bg-transparent p-0"
                value={busqueda}
                onChange={(e) => setBusqueda(e.target.value)}
                onKeyDown={handleBuscar} 
                onBlur={() => setTimeout(() => setMostrarSugerencias(false), 200)}
                onFocus={() => { if (sugerencias.length > 0) setMostrarSugerencias(true) }}
            />

            {/* LISTA DESPLEGABLE DE SUGERENCIAS */}
            {mostrarSugerencias && sugerencias.length > 0 && (
                <ul className="absolute top-full left-0 w-full mt-4 bg-white border border-gray-200 rounded-xl shadow-2xl max-h-80 overflow-y-auto divide-y divide-gray-100">
                    {sugerencias.map((prod) => (
                        <li 
                            key={prod.id_producto} 
                            onMouseDown={() => agregarDesdeSugerencia(prod)} 
                            className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center transition-colors"
                        >
                            <div>
                                <p className="font-bold text-gray-800">{prod.nombre_comercial}</p>
                                <p className="text-xs text-gray-500 flex gap-2 mt-1">
                                    <span>{prod.principio_activo}</span>
                                    {prod.codigo_barras && <span>•{prod.codigo_barras}</span>}
                                </p>
                            </div>
                            <div className="text-right">
                                <span className="font-black text-[#0f3b8e] text-lg">
                                    ${prod.precio_venta.toLocaleString('es-CL')}
                                </span>
                            </div>
                        </li>
                    ))}
                </ul>
            )}
        </div>
    </div>

                    {/* Tabla del Carrito */}
                    <div className="bg-white rounded-xl shadow-sm border border-gray-100 flex-1 overflow-hidden flex flex-col">
                        <div className="overflow-y-auto flex-1 p-0">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-gray-50 text-gray-500 text-xs uppercase sticky top-0 z-10 shadow-sm">
                                    <tr>
                                        <th className="px-6 py-4 font-bold">Producto</th>
                                        <th className="px-6 py-4 font-bold w-32">Precio</th>
                                        <th className="px-6 py-4 font-bold w-40 text-center">Cant.</th>
                                        <th className="px-6 py-4 font-bold w-32 text-right">Subtotal</th>
                                        <th className="px-6 py-4 font-bold w-16"></th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {carrito.length === 0 ? (
                                        <tr>
                                            <td colSpan="5" className="text-center py-20 text-gray-400">
                                                <div className="text-5xl mb-3">🛒</div>
                                                <p>El carrito está vacío</p>
                                            </td>
                                        </tr>
                                    ) : (
                                        carrito.map((item) => (
                                            <tr key={item.id_producto} className="hover:bg-gray-50 transition-colors">
                                                <td className="px-6 py-4 font-semibold text-gray-800">{item.nombre_comercial}</td>
                                                <td className="px-6 py-4 text-gray-600">${item.precio_venta.toLocaleString('es-CL')}</td>
                                                <td className="px-6 py-4">
                                                    <div className="flex items-center justify-center gap-2 bg-gray-100 rounded-lg p-1 w-max mx-auto">
                                                        <button onClick={() => modificarCantidad(item.id_producto, -1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#0f3b8e] font-bold">-</button>
                                                        <span className="w-8 text-center font-bold text-gray-800">{item.cantidad}</span>
                                                        <button onClick={() => modificarCantidad(item.id_producto, 1)} className="w-8 h-8 flex items-center justify-center bg-white rounded shadow-sm text-gray-600 hover:text-[#0f3b8e] font-bold">+</button>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-[#0f3b8e]">
                                                    ${(item.precio_venta * item.cantidad).toLocaleString('es-CL')}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <button onClick={() => eliminarDelCarrito(item.id_producto)} className="text-red-400 hover:text-red-600 bg-red-50 w-8 h-8 rounded-full flex items-center justify-center transition-colors">
                                                        ✖
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>

                {/* LADO DERECHO: Panel de Cobro (30% del ancho) */}
                <div className="w-80 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col p-6">
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Resumen Venta Actual</h3>
                    
                    <div className="flex-1">
                    <div className="flex justify-between items-center mb-3 text-gray-600">
                        <span>Subtotal:</span>
                        <span className="font-semibold">${subtotal.toLocaleString('es-CL')}</span>
                    </div>
                    
                    <div className="flex justify-between items-center mb-3 text-gray-600">
                        <span>Descuento:</span>
                        <div className="flex items-center gap-1">
                            <span className="text-green-500 font-bold">-$</span>
                            <input 
                                type="number" 
                                min="0"
                                value={descuento || ''} 
                                onChange={(e) => {
                                    
                                    const valor = Math.abs(parseInt(e.target.value) || 0);
                                    setDescuento(valor);
                                }}
                                placeholder="0"
                                className="w-24 text-right border border-gray-200 rounded-lg p-1 text-green-500 font-bold focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-colors"
                            />
                        </div>
                    </div>
                        {/* Aquí irían las sugerencias en el futuro */}
                    </div>

                    <div className="border-t pt-4 mt-auto">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-gray-500 font-bold text-sm uppercase">Total a Pagar</span>
                            <span className="text-4xl font-black text-[#0f3b8e]">${total.toLocaleString('es-CL')}</span>
                        </div>

                        <button 
                            onClick={abrirModalCobro}
                            disabled={carrito.length === 0}
                            className="w-full bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-sm transition-colors text-lg flex justify-center items-center gap-2 mb-3"
                        >
                             Cobrar Efectivo
                        </button>
                        <button 
                            disabled={carrito.length === 0}
                            className="w-full bg-[#0f3b8e] hover:bg-[#0a2966] disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-sm transition-colors text-lg flex justify-center items-center gap-2"
                        >
                             Tarjeta
                        </button>
                    </div>
                </div>

            </div>
            {/* MODAL DE COBRO */}  
            {mostrarModalCobro && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[200] flex items-center justify-center p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md">
                        
                        {/* Cabecera del Modal */}
                        <div className="bg-[#0f3b8e] p-4 text-white flex justify-between items-center">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                 Cobrar en Efectivo
                            </h2>
                            <button onClick={cerrarModalCobro} className="text-white text-2xl font-bold">✖</button>
                        </div>

                        {/* Cuerpo del Modal */}
                        <div className="p-6">
                            
                            {/* Resumen a cobrar */}
                            <div className="text-center mb-6 bg-blue-50 p-4 rounded-xl border border-blue-100">
                                <p className="text-gray-500 text-sm font-bold uppercase tracking-wider mb-1">Total a Cobrar</p>
                                <p className="text-4xl font-black text-[#0f3b8e]">${total.toLocaleString('es-CL')}</p>
                            </div>

                            {/* Input de Efectivo Recibido */}
                          <div className="mb-6">
                                <label className="block text-gray-700 font-bold mb-2">Efectivo Recibido del Cliente:</label>
                                <div className="relative">
                                    <span className="absolute inset-y-0 left-0 flex items-center pl-4 text-2xl text-gray-400 font-bold">$</span>
                                    <input 
                                        autoFocus
                                        type="number" 
                                        min="0"
                                        value={efectivoRecibido}
                                        onChange={(e) => setEfectivoRecibido(e.target.value)}
                                        onFocus={() => setMostrarOpcionesEfectivo(true)}
                                        onBlur={() => setTimeout(() => setMostrarOpcionesEfectivo(false), 200)}
                                        className="w-full text-3xl font-bold text-gray-800 border-2 border-gray-300 rounded-xl py-3 pl-10 pr-4 focus:ring-green-500 focus:border-green-500 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                                        placeholder="0"
                                    />

                                    {/* LISTA DESPLEGABLE DE BILLETES */}
                                    {mostrarOpcionesEfectivo && (
                                        <ul className="absolute top-full left-0 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-2xl z-50 overflow-hidden divide-y divide-gray-100 animate-fade-in-down">
                                            
                                            {/* Opción 1: Paga con el Monto Exacto */}
                                            <li 
                                                onMouseDown={() => setEfectivoRecibido(total.toString())}
                                                className="p-4 hover:bg-green-50 cursor-pointer flex justify-between items-center text-lg font-bold text-gray-700 transition-colors"
                                            >
                                                <span>Pago Exacto</span>
                                                <span className="text-green-600">${total.toLocaleString('es-CL')}</span>
                                            </li>

                                            {/* Opciones de Billetes Chilenos */}
                                            {[5000, 10000, 20000].map(billete => (
                                                <li 
                                                    key={billete}
                                                    onMouseDown={() => setEfectivoRecibido(billete.toString())}
                                                    className="p-4 hover:bg-blue-50 cursor-pointer flex justify-between items-center text-lg font-bold text-gray-700 transition-colors"
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

                            {/* Botones de Acción */}
                            <div className="flex gap-3 mb-3">
                                <button 
                                    onClick={anularVenta}
                                    disabled={carrito.length === 0}
                                    className="w-1/3 bg-red-50 hover:bg-red-100 disabled:opacity-50 text-red-600 font-bold py-4 rounded-xl shadow-sm border border-red-100 transition-colors text-lg flex justify-center items-center"
                                    title="Anular venta y vaciar carrito"
                                >
                                     Anular
                                </button>
                                
                                <button 
                                    onClick={abrirModalCobro}
                                    disabled={carrito.length === 0}
                                    className="w-2/3 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white font-bold py-4 rounded-xl shadow-sm transition-colors text-lg flex justify-center items-center gap-2"
                                >
                                     Cobrar
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </PosLayout>
    );
}