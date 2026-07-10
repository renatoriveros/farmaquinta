import PosLayout from '@/Layouts/PosLayout';

export default function Venta({ auth }) {
    return (
        <PosLayout auth={auth} titulo="Informacion de Stock">
            
            {/* TODO LO QUE PONGAS AQUÍ APARECERÁ EN EL CENTRO DE LA PANTALLA */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 h-full flex flex-col items-center justify-center border-dashed border-2 border-gray-200">
                <span className="text-4xl mb-4 text-gray-300">🛒</span>
                <p className="text-gray-500 font-medium text-lg">Módulo de <span className="text-[#0f3b8e] font-bold">Stock</span></p>
                <p className="text-sm text-gray-400 mt-2">Stock con filtros según familia o principio activo ,stock bajo de remedios segun todo, productos por vencer, productos mas vendidos, agregar algun producto para sugerencia de otro producto,   .</p>
            </div>

        </PosLayout>
    );
}