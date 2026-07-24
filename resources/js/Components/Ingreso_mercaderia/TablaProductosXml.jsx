import { useState, useEffect } from 'react';

export default function TablaProductosXml({ productos,onProductosConfirmados }) {

       // Arreglo local para los productos que vamos a editar, si no edito
    const [lineas, setLineas] = useState([]);


    // 1. EFECTO DE CARGA INICIAL (Leer de localStorage) 
 
    useEffect(() => {
        if (productos && productos.length > 0) {
            try {
                const borradorGuardado = localStorage.getItem('borrador_xml_lineas');
                
                if (borradorGuardado) {
                    const lineasGuardadas = JSON.parse(borradorGuardado);
                    
                    // Validación ultra-segura: 
                    // 1. Verificamos que sea realmente un Array
                    // 2. Que tenga elementos
                    // 3. Usamos el signo de interrogación (?) por si algún dato viene nulo, para que no explote
                    if (
                        Array.isArray(lineasGuardadas) && 
                        lineasGuardadas.length > 0 && 
                        lineasGuardadas[0]?.nombre_comercial === productos[0]?.nombre_comercial
                    ) {
                        setLineas(lineasGuardadas);
                        return; 
                    }
                }
            } catch (error) {
                // Si la memoria del navegador estaba corrupta, atrapamos el error en silencio
                console.warn("Borrador corrupto encontrado. Limpiando localStorage...");
                localStorage.removeItem('borrador_xml_lineas'); // Borramos la basura para la próxima vez
            }

            // Si no hay borrador, los productos son distintos, o hubo un error leyendo la memoria:
            // Iniciamos el estado desde cero de forma segura
               const filasPreparadas = productos.map(prod => ({
                ...prod, //representa el elemento actual en cada vuelta del ciclo map
                // Agregamos dos campos nuevos exclusivamente para el Frontend
                cantidad_ingreso: prod.cantidad, // Por defecto, sugerimos la del XML, que es producto.cantidad
                confirmado: false                // Por defecto, sin check
            }));
            setLineas(filasPreparadas);
        }
    }, [productos]);

     // 2. EFECTO DE AUTOGUARDADO (Escribir en localStorage)
    useEffect(() => {

        if (lineas.length > 0) {
            localStorage.setItem('borrador_xml_lineas', JSON.stringify(lineas));// guardamos una fotocopia actualizada en el localStorage
        }
    }, [lineas]);//cada vez que algo cambie en lineas, se ejecuta el efecto de autoguardado


     if (!productos || productos.length === 0) return null;//valido que el arreglo de productos no venga vacio

    const formatearDinero = (monto) => {
        return new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' }).format(monto);
    };
   
    // Función para actualizar cantidad recibida
    const handleCambiarCantidad = (index, nuevaCantidad) => {
        const nuevasLineas = [...lineas];//fotocopia del arreglo lineas
        nuevasLineas[index].cantidad_ingreso = nuevaCantidad; // Modifica la fotocopia
        setLineas(nuevasLineas);//seteo el arrgelo original con la fotocopia modificada
    };

    // Función para marcar o desmarcar el checkbox
    const handleToggleCheck = (index) => {
        const nuevasLineas = [...lineas];//creo la copia de el arregla lineas llamado nuevasLineas
        nuevasLineas[index].confirmado = !nuevasLineas[index].confirmado;//cambia el valor de confirmado a su opuesto
        setLineas(nuevasLineas);
    };
    //los handles son funciones que se ejecutan cuando el usuario interactua con la interfaz, como cambiar la cantidad o marcar el checkbox

    // Efecto para enviar los productos confirmados al padre
    useEffect(() => {
        const productosConfirmados = lineas.filter(linea => linea.confirmado);
        // Aquí podrías enviar los productos confirmados al componente padre si lo deseas
        // Por ejemplo, usando una función pasada como prop:
        if (typeof onProductosConfirmados === 'function') {
            onProductosConfirmados(productosConfirmados);
        }
    }, [lineas, onProductosConfirmados]);

    return (
        <div className="mt-8 bg-white border border-gray-200 rounded-lg shadow-sm overflow-hidden">
            
            <div className="bg-[#0f3b8e] px-4 py-3 border-b border-gray-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-white">
                    Validación Física ({lineas.length} productos)
                </h3>
                <span className="text-sm text-blue-200">
                    Marca los productos a medida que los ingresas al stock
                </span>
            </div>
            
            <div className="overflow-x-auto">
                <table className="w-full text-sm text-left text-gray-600">
                    <thead className="text-xs text-gray-700 uppercase bg-gray-50 border-b border-gray-200">
                        <tr>
                            
                            <th scope="col" className="px-6 py-3 font-semibold">Producto</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-center">Cant. Facturada</th>                         
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Precio Unit.</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-right">Total Fila</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-center text-blue-600 bg-blue-50">Cant. a Ingresar</th>
                            <th scope="col" className="px-6 py-3 font-semibold text-center">OK</th>
                        </tr>
                    </thead>
                    <tbody>
                        {lineas.map((linea, index) => (
                            <tr 
                                key={index} 
                                className={`border-b border-gray-100 transition-colors 
                                    ${linea.confirmado ? 'bg-green-50' : (index % 2 === 0 ? 'bg-white' : 'bg-gray-50/50')}`}
                            >
                            
                                {/* NOMBRE, LOTE Y CODIGO BARRAS */}
                                <td className="px-6 py-4 font-medium text-gray-900">
                                    {linea.nombre_comercial}
                                    <div className="text-xs text-gray-500 font-normal mt-1">
                                        EAN: {linea.codigo_barras || 'Sin código'} 
                                        {/* CORRECCIÓN 2: Mostramos el número de lote si existe */}
                                        {linea.numero_lote && ` | Lote: ${linea.numero_lote}`}
                                        {linea.fecha_caducidad && ` | Vence: ${linea.fecha_caducidad}`}
                                    </div>
                                </td>

                                {/* CANTIDAD DEL XML (Intocable) */}
                                <td className="px-6 py-4 text-center">
                                    <span className="bg-gray-200 text-gray-700 py-1 px-3 rounded-md font-semibold">
                                        {linea.cantidad}
                                    </span>
                                </td>

                                {/* PRECIO Y TOTAL */}
                                <td className="px-6 py-4 text-right">
                                    {formatearDinero(linea.precio_unitario)}
                                </td>
                                <td className="px-6 py-4 text-right font-bold text-gray-800">
                                    {formatearDinero(linea.monto_total)}
                                </td>

                                 {/* CANTIDAD REAL A INGRESAR (Editable) */}
                                <td className="px-6 py-4 text-center bg-blue-50/30">
                                    <input 
                                        type="number"
                                        min="0"
                                        max={linea.cantidad}
                                        disabled={linea.confirmado} // disabled viene de fabrica en html
                                        className={`w-24 text-center border rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm 
                                            ${linea.confirmado ? 'bg-green-100 border-green-300 text-green-800 font-bold' : 'border-gray-300'}`}
                                        value={linea.cantidad_ingreso}//value viene de fabrica en html, controla lo que se ve en el input
                                        onChange={(e) => handleCambiarCantidad(index, e.target.value)}// Necesita saber donde (index) y que escribio el usuario (e.target.value)
                                    />
                                </td>
                                {/* CHECKBOX DE VALIDACIÓN */}
                                <td className="px-6 py-4 text-center">
                                    <input 
                                        type="checkbox" 
                                        className="w-5 h-5 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
                                        checked={linea.confirmado}//checked viene de fabrica en html,controla si el checkbox esta marcado o no
                                        onChange={() => handleToggleCheck(index)}// Solo necesita saber donde (index), porque el checkbox solo cambia entre true y false
                                    />
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}