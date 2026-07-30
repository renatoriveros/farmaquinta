import { useState, useEffect } from 'react';
import axios from 'axios';
import PosLayout from '@/Layouts/PosLayout';
import TablaProductosXml from '@/Components/Stock/Ingreso_mercaderia/TablaProductosXml';

export default function IngresoStock({ auth }) {
    // ==========================================
    // 1. LOS CONST (El estado / La memoria)
    // ==========================================
    const [archivoXml, setArchivoXml] = useState(null);
    const [errorValidacion, setErrorValidacion] = useState('');
    const [cargando, setCargando] = useState(false); 
    const [datosFactura, setDatosFactura] = useState(null); 
    const [productosConfirmados, setProductosConfirmados] = useState([]);
    //alertas
    const [notificacion, setNotificacion] = useState({ visible: false, mensaje: '', tipo: '' });

    const mostrarAlerta = (mensaje, tipo = 'error') => {//le mando los parametros a mostrarAlerta, asi seteo la notificacion 
    setNotificacion({ visible: true, mensaje, tipo });//y la desaparezco cada 3 segundos
    setTimeout(() => {
        setNotificacion({ visible: false, mensaje: '', tipo: '' });
    }, 10000); 
};

    // ==========================================
    // EFECTO DE CARGA INICIAL: Recuperar datos del padre al cambiar de página
    // ==========================================
    useEffect(() => {
        const facturaGuardada = localStorage.getItem('facturaActual');//facturaActual es la key que usamos para guardar el objeto JSON de la factura en el localStorage
        //ya que localStorage solo guarda strings, usamos JSON.stringify para guardar y JSON.parse para recuperar
        if (facturaGuardada) {
            try {
                const datosParseados = JSON.parse(facturaGuardada);//el parse es para convertir el string de vuelta a objeto
                setDatosFactura(datosParseados); 
            } catch (error) {
                console.warn("No se pudo cargar la factura previa en el ingreso.");
                localStorage.removeItem('facturaActual');
            }
        }
    }, []);

    // ==========================================
    // 2. LOS HANDLES (Las acciones/funciones)
    // ==========================================
    const handleSeleccionarArchivo = (evento) => {
        setErrorValidacion('');
        setDatosFactura(null); 
        
        const archivoSeleccionado = evento.target.files[0];

        if (!archivoSeleccionado) {
            setArchivoXml(null);
            return;
        }

        if (archivoSeleccionado.type !== 'text/xml' && !archivoSeleccionado.name.endsWith('.xml')) {
            setErrorValidacion('Por favor, selecciona un archivo XML válido.');
            setArchivoXml(null);
            return;
        }

        setArchivoXml(archivoSeleccionado);
    };

    const handleProcesarArchivo = async () => {
        if (!archivoXml) return;

        setCargando(true); 
        setErrorValidacion('');

        const formData = new FormData();
        formData.append('archivo_xml', archivoXml);

        try {
            const respuesta = await axios.post('/stock/ingreso/previsualizar', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            const datosObtenidos = respuesta.data.datos_factura;

            
            setDatosFactura(datosObtenidos);
            
            //  Guardamos en el localStorage para sobrevivir al cambio de pagina
            localStorage.setItem('facturaActual', JSON.stringify(datosObtenidos));
            
        } catch (error) {
            console.error("Error del servidor:", error);
            const mensajeBackend = error.response?.data?.message || 'Hubo un problema al procesar el archivo en el servidor.';
            mostrarAlerta(mensajeBackend, 'error');
            setArchivoXml(null);o
        } finally {
            setCargando(false);
        }
    };

    // Función opcional para limpiar y permitir subir otra factura
    const handleLimpiarFactura = () => {
        setDatosFactura(null);
        setArchivoXml(null);
        localStorage.removeItem('facturaActual');
        localStorage.removeItem('borrador_xml_lineas'); 
    };

    // Función para guardar el lote definitivo en la base de datos
    const handleGuardarLoteDefinitivo = async () => {
    // 1. Armamos el Payload:  paquete de datos que enviaremos con axios.post
    if (!datosFactura || productosConfirmados.length === 0) {
        alert("No hay datos de factura o productos confirmados para guardar.");
        return;
    }
    const payload = {
        factura: {
            //los datos de factura salen de datosFactura, que es el objeto que primero guardamos con la data del XML que viene del controler de ingresoMercaderiaController
            id_proveedor: datosFactura.proveedor.rut, 
            folio: datosFactura.documento.folio,
            fecha_emision: datosFactura.documento.fecha_emision
        },
        //los datos salen de productosConfirmados, que es el arreglo que nos envia TablaProductosXml con los productos confirmados
        productos: productosConfirmados, // El arreglo completo que nos envia TablaProductosXml con los productos confirmados
        id_sucursal: auth.user.id_sucursal, //usamos auth porque nos da la data del usuario logueado
    };

    try {
        
        // petición POST
        const response = await axios.post('/stock/ingreso/guardar', payload);
        
        //  si sale bien
        if (response.status === 200 || response.status === 201) {
            mostrarAlerta('Ingreso registrado exitosamente', 'exito');
            
           // limpiamos datosFactura,archivoXml y los local storage de ingreso(facturaActual) y de tablaproductos.jsx(borrador_xml_lineas)
            handleLimpiarFactura(); 
            
            //  Limpiamos también el estado de productos confirmados
            setProductosConfirmados([]);
        }

    } catch (error) {
        console.error("Error al guardar:", error);
        
        if (error.response && error.response.data) {
            console.log("Detalle del error de Laravel:", error.response.data); 
            
            // Extraer el mensaje real que mandó el controlador
            const mensajeReal = error.response.data.error || "Error del servidor";
            mostrarAlerta(mensajeReal, 'error');
        } else {
            mostrarAlerta("Ocurrió un error de conexión o el servidor no responde.", 'error');
        }
    }
};

    // ==========================================
    // 3. EL RENDER (JSX)
    // ==========================================
    return (
        <PosLayout auth={auth} titulo="Ingreso de Stock">
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-4 sm:p-6 lg:p-8 h-full flex flex-col items-center justify-start w-full max-w-full lg:max-w-6xl mx-auto mt-6">

                <div className="w-full flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-[#0f3b8e]">Cargar Factura Electrónica (XML)</h2>
                    
                    {datosFactura && (
                        <button 
                            onClick={handleLimpiarFactura}
                            className="px-4 py-2 bg-red-100 text-red-700 font-semibold rounded-lg hover:bg-red-200 transition-colors text-sm"
                        >
                            Cargar otra factura
                        </button>
                    )}

                    {notificacion.visible && (
                        <div className={`fixed top-6 right-6 z-[100] px-6 py-4 rounded-xl shadow-2xl font-bold transition-all duration-300 animate-fade-in-down flex items-center gap-3 ${
                            notificacion.tipo === 'error' 
                                ? 'bg-red-50 text-red-600 border-l-4 border-red-500' 
                                : notificacion.tipo === 'exito'
                                    ? 'bg-green-50 text-green-700 border-l-4 border-green-500'
                                    : 'bg-yellow-50 text-yellow-700 border-l-4 border-yellow-500'
                        }`}>
                            <span className="text-xl">
                                {/* Opcional: Agregamos emojis simples según el tipo para que no quede el span vacío */}
                                {notificacion.tipo === 'error' ? '' : notificacion.tipo === 'exito' ? '' : ''}
                            </span>
                            {notificacion.mensaje}
                        </div>
                    )}
                </div>
                
                {/* Zona de carga */}
                {!datosFactura && (
                    <div className="w-full border-dashed border-2 border-gray-300 rounded-lg p-10 flex flex-col items-center justify-center bg-gray-50 mb-6">
                        <input 
                            type="file" 
                            accept=".xml"
                            className="mb-4 text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-[#0f3b8e] file:text-white hover:file:bg-blue-800"
                            onChange={handleSeleccionarArchivo}
                        />

                        {errorValidacion && (
                            <p className="text-red-500 text-sm mt-2 font-medium">{errorValidacion}</p>
                        )}

                        {archivoXml && (
                            <button 
                                onClick={handleProcesarArchivo}
                                disabled={cargando}
                                className="mt-6 px-6 py-2 bg-green-600 text-white font-bold rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                            >
                                {cargando ? 'Procesando XML...' : 'Procesar Factura y Extraer Datos'}
                            </button>
                        )}
                    </div>
                )}

                {/* Zona: Mostrar los datos extraídos o recuperados */}
                    {datosFactura && (
                        <div className="w-full animate-fade-in">
                            {datosFactura.proveedor && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                    <h3 className="text-lg font-bold text-blue-900">Resumen del Documento</h3>
                                    {/* Cerramos el grid justo después de los 4 datos */}
                                    <div className="grid grid-cols-2 gap-4 mt-2 text-sm">
                                        <p><strong>Proveedor:</strong> {datosFactura.proveedor.razon_social} (RUT: {datosFactura.proveedor.rut})</p>
                                        <p><strong>Folio:</strong> #{datosFactura.documento.folio}</p>
                                        <p><strong>Fecha:</strong> {datosFactura.documento.fecha_emision}</p>
                                        <p><strong>Monto Total:</strong> ${datosFactura.documento.monto_total}</p>
                                    </div>
                                </div>
                            )}
                            
                            {/* La tabla se renderiza normal */}
                            <TablaProductosXml 
                                productos={datosFactura.productos}
                                onProductosConfirmados={setProductosConfirmados} 
                            />

                            {/* Renderizado condicional: MOVIDO AQUÍ ABAJO */}
                            {/* Solo se muestra si hay al menos 1 producto confirmado y se ubica al final de todo el proceso */}
                            {productosConfirmados && productosConfirmados.length > 0 && (
                                <div className="flex justify-end mt-6 border-t-2 border-gray-200 pt-6 mb-10">
                                    <button 
                                        onClick={handleGuardarLoteDefinitivo}
                                        className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg shadow-md transition-colors"
                                    >
                                        Guardar Ingreso ({productosConfirmados.length} productos)
                                    </button>
                                </div>
                            )}
                        </div>
                    )}

            </div>
        </PosLayout>
    );
}