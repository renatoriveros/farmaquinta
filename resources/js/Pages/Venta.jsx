import PosLayout from '@/Layouts/PosLayout';
import { useState, useEffect } from 'react';
import axios from 'axios';
import BuscadorProducto from '@/Components/Pos/BuscadorProducto';
import CarritoVenta from '@/Components/Pos/CarritoVenta';
import PanelCobro from '@/Components/Pos/PanelCobro';
import ModalCobroEfectivo from '@/Components/Pos/ModalCobroEfectivo';
import ModalVentasPendientes from '@/Components/Pos/ModalVentasPendientes';

export default function Venta({ auth }) {
    // ESTADOS GLOBALES DEL PUNTO DE VENTA
    const [carrito, setCarrito] = useState(() => {
        const carritoGuardado = localStorage.getItem('farmaquinta_carrito');
        return carritoGuardado ? JSON.parse(carritoGuardado) : [];
    });
    const [descuento, setDescuento] = useState(() => {
        const descuentoGuardado = localStorage.getItem('farmaquinta_descuento');
        return descuentoGuardado ? JSON.parse(descuentoGuardado) : 0;
    });

    const [tipoDescuento, setTipoDescuento] = useState('$');
    const [montoDescuentoFinal, setMontoDescuentoFinal] = useState(0);
    
    const [subtotal, setSubtotal] = useState(0);
    const [total, setTotal] = useState(0);
    
    // ESTADOS DE LA INTERFAZ
    const [mostrarModalCobro, setMostrarModalCobro] = useState(false);
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });
    // ESTADOS PARA VENTAS EN ESPERA
    const [ventasPendientes, setVentasPendientes] = useState(() => {
        const pendientesGuardadas = localStorage.getItem('farmaquinta_pendientes');
        return pendientesGuardadas ? JSON.parse(pendientesGuardadas) : [];
    });
    const [mostrarModalPendientes, setMostrarModalPendientes] = useState(false);

    // EFECTO: Calcular el subtotal y total del carrito + descuento
    useEffect(() => {
        const nuevoSubtotal = carrito.reduce((acc, item) => acc + (item.precio_venta * item.cantidad), 0);
        setSubtotal(nuevoSubtotal);

       let montoDescontado = 0;
        if (tipoDescuento === '%') {
            // Usamos Math.round() para eliminar los decimales del porcentaje
            montoDescontado = Math.round((nuevoSubtotal * descuento) / 100);
        } else {
            // Usamos Math.round() por si el cajero escribió un decimal accidentalmente
            montoDescontado = Math.round(descuento);
        }

        // Protección: El descuento no puede ser mayor al subtotal
        if (montoDescontado > nuevoSubtotal) {
            montoDescontado = nuevoSubtotal;
        }

        // Guardamos el dinero real calculado para enviarlo a Laravel
        setMontoDescuentoFinal(montoDescontado);

        const calculoTotal = nuevoSubtotal - montoDescontado;
        setTotal(calculoTotal > 0 ? calculoTotal : 0);
    }, [carrito, descuento, tipoDescuento]); // <-- Se agregó tipoDescuento como dependencia

    // EFECTOS: Auto-guardado en LocalStorage
    useEffect(() => {
        localStorage.setItem('farmaquinta_carrito', JSON.stringify(carrito));
    }, [carrito]);

    useEffect(() => {
        localStorage.setItem('farmaquinta_descuento', JSON.stringify(descuento));
    }, [descuento]);

    useEffect(() => {
        localStorage.setItem('farmaquinta_pendientes', JSON.stringify(ventasPendientes));
    }, [ventasPendientes]);

    // FUNCIÓN: Mostrar notificaciones suaves
    const mostrarAlerta = (mensaje, tipo = 'error') => {
        setNotificacion({ visible: true, mensaje, tipo });
        setTimeout(() => {
            setNotificacion({ visible: false, mensaje: '', tipo: '' });
        }, 3000);
    };

    // FUNCIONES DEL CARRITO
  const agregarAlCarrito = (productoNuevo) => {
        // 1. Verificamos si el producto ya está en el carrito actual
        const productoExistente = carrito.find(item => item.id_producto === productoNuevo.id_producto);
        
        if (productoExistente) {
            // Si ya existe, verificamos si sumarle 1 unidad más romperá el stock físico
            if (productoExistente.cantidad + 1 > productoNuevo.stock_maximo) {
                mostrarAlerta(`Límite de stock (${productoNuevo.stock_maximo}) alcanzado para este producto.`, "error");
                return; // Cortamos la ejecución, el escáner no suma nada
            }
        }

        // 2. Si pasa las validaciones, procedemos a actualizar el estado
        setCarrito((prevCarrito) => {
            const existe = prevCarrito.find(item => item.id_producto === productoNuevo.id_producto);
            if (existe) {
                return prevCarrito.map(item => 
                    item.id_producto === productoNuevo.id_producto 
                        ? { ...item, cantidad: item.cantidad + 1 }
                        : item
                );
            }
            return [...prevCarrito, productoNuevo];
        });
    };

 const modificarCantidad = (id, delta) => {
        // 1. Buscamos el producto actual en el carrito ANTES de modificar el estado
        const productoEnCarrito = carrito.find(item => item.id_producto === id);
        
        if (productoEnCarrito) {
            const nuevaCantidad = productoEnCarrito.cantidad + delta;
            
            // 2. Bloqueo de Stock Máximo (Solo si el cajero presionó el botón "+" y superó el límite)
            if (delta > 0 && nuevaCantidad > productoEnCarrito.stock_maximo) {
                mostrarAlerta(`Solo hay ${productoEnCarrito.stock_maximo} unidades disponibles en stock.`, "error");
                return; // Cortamos la ejecución aquí, no se suma nada
            }

            // 3. Si pasa la validación, actualizamos el carrito normalmente
            setCarrito((prev) => prev.map(item => {
                if (item.id_producto === id) {
                    return { ...item, cantidad: nuevaCantidad > 0 ? nuevaCantidad : 1 };
                }
                return item;
            }));
        }
    };

    const eliminarDelCarrito = (id) => {
        setCarrito((prev) => prev.filter(item => item.id_producto !== id));
    };

   const anularVenta = () => {
        setCarrito([]);
        setDescuento(0);
        mostrarAlerta("Venta anulada y carrito vaciado", "error");
    };

    // FUNCIONES DEL MODAL DE COBRO
    const abrirModalCobro = (metodo) => {
        if (metodo === 'efectivo') {
            setMostrarModalCobro(true);
        } else {
            // Simulamos los otros botones por ahora
            mostrarAlerta(`Procesando pago con ${metodo}...`, "success");
        }
    };
    const cerrarModalCobro = () => setMostrarModalCobro(false);

    // LA FUNCIÓN QUE CONECTA CON LARAVEL
    const procesarVentaEfectivo = async (efectivo, vuelto) => {
        // Validación extra de seguridad por si acaso
        if (!auth.turno_activo) {
            mostrarAlerta("No hay un turno activo. Abre caja primero.", "error");
            return;
        }

        try {
            const payload = {
                carrito: carrito,
                total_venta: total,
                descuento: montoDescuentoFinal,
                metodo_pago: 'Efectivo',
                id_sucursal: auth.user.id_sucursal,
                id_turno: auth.turno_activo.id_turno,
                pago_recibido: efectivo,
                vuelto: vuelto
            };

            // Cambiamos el mensaje para avisar que se está procesando
            mostrarAlerta("Procesando venta...", "success");

            const respuesta = await axios.post('/procesar-venta', payload);

            if (respuesta.data.success) {
                mostrarAlerta(`¡Venta exitosa! Folio: ${respuesta.data.id_venta}`, "success");
                setCarrito([]); // Vaciamos carrito
                setDescuento(0); // Reiniciamos descuento
                cerrarModalCobro(); // Cerramos el modal
            }
        } catch (error) {
            console.error("Error al procesar la venta:", error);
            mostrarAlerta(error.response?.data?.mensaje || 'Error al conectar con el servidor', "error");
        }
    };

  
    // FUNCIONES DE VENTAS EN ESPERA
    const pausarVentaActual = () => {
        const nuevaVentaPausada = {
            id: Date.now(),
            hora: new Date().toLocaleTimeString('es-CL', { hour: '2-digit', minute: '2-digit' }),
            carrito: [...carrito],
            descuento: descuento,
            total: total
        };
        
        setVentasPendientes([...ventasPendientes, nuevaVentaPausada]);
        setCarrito([]);
        setDescuento(0);
        mostrarAlerta("Venta guardada en espera", "success");
    };

    const recuperarVenta = (ventaPausada) => {
        if (carrito.length > 0) {
            if (!confirm("Tienes productos en la caja actual. ¿Deseas reemplazarlos por la venta recuperada?")) return;
        }
        
        setCarrito(ventaPausada.carrito);
        setDescuento(ventaPausada.descuento);
        setVentasPendientes(ventasPendientes.filter(v => v.id !== ventaPausada.id));
        setMostrarModalPendientes(false);
        mostrarAlerta("Venta recuperada en caja", "success");
    };

    const eliminarVentaPendiente = (id) => {
        setVentasPendientes(ventasPendientes.filter(v => v.id !== id));
    };

    return (
        // ... tu código visual (PosLayout, etc.)
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
                    
                    {/* ENCABEZADO Y AVISO DE VENTAS EN ESPERA */}
                    <div className="flex justify-between items-center h-10">
                        <h2 className="text-2xl font-black text-gray-800">{auth.user.name}</h2>
                        {ventasPendientes.length > 0 && (
                            <button 
                                onClick={() => setMostrarModalPendientes(true)}
                                className="bg-amber-100 text-amber-700 hover:bg-amber-200 px-4 py-2 rounded-xl font-bold flex items-center gap-2 transition-colors shadow-sm animate-fade-in"
                            >
                                 En Espera ({ventasPendientes.length})
                            </button>
                        )}
                    </div>

                    
            {/* Buscador / Escáner con Predictivo */}
            <BuscadorProducto 
                    onProductoEncontrado={agregarAlCarrito} 
                    mostrarAlerta={mostrarAlerta} 
                />

                    {/* Tabla del Carrito */}
                    <CarritoVenta 
                        items={carrito} 
                        onModificar={modificarCantidad}
                        onEliminar={eliminarDelCarrito} 
                    />
                </div>

                 {/* LADO DERECHO: Panel de Cobro (30% del ancho) */}
                 <div className="w-[30%] bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col justify-between">
                        <PanelCobro 
                            subtotal={subtotal}
                            descuento={descuento}
                            total={total}
                            onChangeDescuento={setDescuento}
                            tipoDescuento={tipoDescuento}
                            onChangeTipoDescuento={setTipoDescuento}
                            onAnular={anularVenta}
                            onPausar={pausarVentaActual}
                            onAbrirCobro={abrirModalCobro}
                            carritoVacio={carrito.length === 0}
                        />
                 </div>

            </div>
            {/* MODAL DE COBRO */}  
            <ModalCobroEfectivo 
                isOpen={mostrarModalCobro}
                onClose={cerrarModalCobro}
                total={total}
                onConfirmarVenta={procesarVentaEfectivo}
            />
            {/* MODAL DE VENTAS EN ESPERA */}
            <ModalVentasPendientes
                isOpen={mostrarModalPendientes}
                onClose={() => setMostrarModalPendientes(false)}
                pendientes={ventasPendientes}
                onRecuperar={recuperarVenta}
                onEliminar={eliminarVentaPendiente}
            />

        </PosLayout>
    );
}