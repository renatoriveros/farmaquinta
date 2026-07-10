import { Head, Link, usePage } from '@inertiajs/react';

export default function PosLayout({ auth, children, titulo }) {
    // Obtenemos la URL actual para saber qué botón del menú pintar de azul
    const { url } = usePage();

    return (
        <div className="flex h-screen bg-[#f4f7f6] font-sans">
            <Head title={`${titulo}`} />

            {/* BARRA LATERAL (SIDEBAR ESTÁTICO) */}
            <aside className="w-64 bg-[#232936] text-gray-300 flex flex-col h-full shadow-2xl z-20">
                <div className="p-6 border-b border-gray-700/50">
                    <h2 className="text-xl font-bold text-white flex items-center gap-2">
                        <span className="text-[#3b82f6]">Control farma</span>
                    </h2>
                    {/* Leemos la sucursal del usuario */}
                    <p className="text-xs text-gray-500 mt-1">Sucursal 0{auth.user.id_sucursal || 1} - {auth.user.name}</p>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    {/* Botones reales usando el componente Link de Inertia */}
                    <Link href="/venta" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${url.startsWith('/venta') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}>
                        Punto de Venta
                    </Link>
                    
                    <Link href="/stock" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${url.startsWith('/stock') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}>
                        Inventario
                    </Link>

                    <Link href="/historial" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${url.startsWith('/historial') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}>
                        Historial
                    </Link>
                </nav>

                <div className="p-4 border-t border-gray-700/50 space-y-4">
                    
                    <Link href={route('logout')} method="post" as="button" className="w-full flex items-center gap-3 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-semibold">
                        <span></span> Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* CABECERA (HEADER ESTÁTICO) */}
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-8 shadow-sm z-10 shrink-0">
                    {/* Usamos la propiedad "titulo" que nos pasen las páginas */}
                    <h1 className="text-2xl font-bold text-[#0f3b8e]">{titulo}</h1>

                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> SII Online?, o transbanck
                        </div>
                    </div>
                </header>

                {/* AQUÍ SE INYECTAN TUS PÁGINAS (Venta, Stock, Historial) */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#f4f7f6]">
                    {children}
                </div>
            </main>
        </div>
    );
}