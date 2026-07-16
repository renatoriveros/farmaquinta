import PosLayout from '@/Layouts/PosLayout';
import { useState, useEffect } from 'react';

export default function Venta({ auth }) {
    // ESTADOS DEL PUNTO DE VENTA
    const [busqueda, setBusqueda] = useState('');
    const [carrito, setCarrito] = useState([]);
    const [total, setTotal] = useState(0);

    // Efecto para recalcular el total cada vez que el carrito cambia
    useEffect(() => {
        const nuevoTotal = carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
        setTotal(nuevoTotal);
    }, [carrito]);

    // Simulador de búsqueda (Pronto lo conectaremos a tu base de datos real)
    const handleBuscar = (e) => {
        if (e.key === 'Enter' && busqueda.trim() !== '') {
            e.preventDefault();
            
            // Aquí haremos la petición a Laravel después. Por ahora, simulamos encontrar un producto:
            const productoSimulado = {
                id_producto: Date.now(), // ID temporal
                codigo_barras: busqueda,
                nombre_comercial: busqueda === '7801234567890' ? 'Paracetamol 500mg' : 'Producto Genérico',
                precio_venta: 1500,
                cantidad: 1,
            };

            agregarAlCarrito(productoSimulado);
            setBusqueda(''); // Limpiamos el buscador (listo para el siguiente escaneo)
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

    return (
        <PosLayout auth={auth} titulo="Punto de Venta">
            <div className="flex gap-6 h-full">
                
                {/* LADO IZQUIERDO: Buscador y Tabla del Carrito (70% del ancho) */}
                <div className="flex-1 flex flex-col gap-4">
                    
                    {/* Buscador / Escáner */}
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center gap-3">
                        <span className="text-2xl text-gray-400">🔍</span>
                        <input 
                            type="text" 
                            autoFocus
                            placeholder="Escanee el código de barras o escriba el nombre del producto y presione Enter..." 
                            className="flex-1 border-none focus:ring-0 text-lg text-gray-700 bg-transparent"
                            value={busqueda}
                            onChange={(e) => setBusqueda(e.target.value)}
                            onKeyDown={handleBuscar}
                        />
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
                    <h3 className="text-lg font-bold text-gray-800 border-b pb-4 mb-4">Resumen de Venta</h3>
                    
                    <div className="flex-1">
                        <div className="flex justify-between items-center mb-3 text-gray-600">
                            <span>Subtotal:</span>
                            <span className="font-semibold">${total.toLocaleString('es-CL')}</span>
                        </div>
                        <div className="flex justify-between items-center mb-3 text-gray-600">
                            <span>Descuentos:</span>
                            <span className="font-semibold text-green-500">-$0</span>
                        </div>
                        {/* Aquí irían las sugerencias en el futuro */}
                    </div>

                    <div className="border-t pt-4 mt-auto">
                        <div className="flex justify-between items-end mb-6">
                            <span className="text-gray-500 font-bold text-sm uppercase">Total a Pagar</span>
                            <span className="text-4xl font-black text-[#0f3b8e]">${total.toLocaleString('es-CL')}</span>
                        </div>

                        <button 
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
        </PosLayout>
    );
}