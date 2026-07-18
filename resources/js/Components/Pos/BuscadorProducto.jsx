import { useState, useEffect, useRef } from 'react';
import axios from 'axios';

export default function BuscadorProducto({ onProductoEncontrado, mostrarAlerta }) {
    const [busqueda, setBusqueda] = useState('');
    const [sugerencias, setSugerencias] = useState([]);
    const [mostrarSugerencias, setMostrarSugerencias] = useState(false);
    const buscadorRef = useRef(null);

    useEffect(() => {
        if (buscadorRef.current) buscadorRef.current.focus();
    }, []);

    useEffect(() => {
        const texto = busqueda.trim();
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

    const handleBuscar = async (e) => {
        const valorActual = e.target.value.trim();

        if (e.key === 'Enter' && valorActual !== '') {
            e.preventDefault();
            setMostrarSugerencias(false); 
            
            try {
                const respuesta = await axios.get(route('api.productos.buscar'), {
                    params: { q: valorActual } 
                });

                const productosEncontrados = respuesta.data;

                if (productosEncontrados.length === 1) {
                    onProductoEncontrado({
                        id_producto: productosEncontrados[0].id_producto,
                        codigo_barras: productosEncontrados[0].codigo_barras,
                        nombre_comercial: productosEncontrados[0].nombre_comercial,
                        precio_venta: productosEncontrados[0].precio_venta,
                        cantidad: 1,
                        stock_maximo: productosEncontrados[0].lotes_sum_cantidad_disponible 
                    });
                    setBusqueda(''); 
                } else if (productosEncontrados.length > 1) {
                    mostrarAlerta("Múltiples resultados. Por favor seleccione de la lista.", "warning");
                    setSugerencias(productosEncontrados);
                    setMostrarSugerencias(true);
                } else {
                    mostrarAlerta("Producto no encontrado en el sistema", "error");
                    setBusqueda('');
                }
            } catch (error) {
                console.error("Error buscando el producto:", error);
            }
            
            if (buscadorRef.current) buscadorRef.current.focus();
        }
    };

    const agregarDesdeSugerencia = (producto) => {
        onProductoEncontrado({
            id_producto: producto.id_producto,
            codigo_barras: producto.codigo_barras,
            nombre_comercial: producto.nombre_comercial,
            precio_venta: producto.precio_venta,
            cantidad: 1,
            stock_maximo: producto.lotes_sum_cantidad_disponible
        });
        setBusqueda('');
        setSugerencias([]);
        setMostrarSugerencias(false);
        if (buscadorRef.current) buscadorRef.current.focus();
    };

    return (
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
                                        {prod.codigo_barras && <span>• {prod.codigo_barras}</span>}
                                        {/* INYECCIÓN DEL STOCK RESPETANDO TU DISEÑO */}
                                        <span className="text-emerald-600 font-bold">• Stock: {prod.lotes_sum_cantidad_disponible || 0}</span>
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
    );
}