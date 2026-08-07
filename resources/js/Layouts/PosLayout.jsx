import { Head, Link, usePage } from '@inertiajs/react';
import { useState } from 'react';
import ModalAbrirTurno from '@/Components/Abrir_y_Cerrar/ModalAbrirTurno';
import ModalCerrarTurno from '@/Components/Abrir_y_Cerrar/ModalCerrarTurno';

export default function PosLayout({ auth, children, titulo }) {
    // Obtenemos la URL actual para saber qué botón del menú pintar de azul
    const { url } = usePage();
    //sirve para mostrar el menu
    const [menuNuevoAbierto, setMenuNuevoAbierto] = useState(false);
    const [menuStockAbierto, setMenuStockAbierto] = useState(false);
    const [menuHistorialAbierto, setMenuHistorialAbierto] = useState(false);
    const [menuDashboardAbierto, setMenuDashboardAbierto] = useState(false);
    
    // Estado para el menú lateral en móviles
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    // Función para manejar el acordeón: abre uno y cierra los demás
    const handleToggleMenu = (menuName) => {
        if (menuName === 'nuevo') {
            setMenuNuevoAbierto(!menuNuevoAbierto);
            setMenuStockAbierto(false);
            setMenuHistorialAbierto(false);
            setMenuDashboardAbierto(false);
        } else if (menuName === 'stock') {
            setMenuStockAbierto(!menuStockAbierto);
            setMenuNuevoAbierto(false);
            setMenuHistorialAbierto(false);
            setMenuDashboardAbierto(false);
        } else if (menuName === 'historial') {
            setMenuHistorialAbierto(!menuHistorialAbierto);
            setMenuNuevoAbierto(false);
            setMenuStockAbierto(false);
            setMenuDashboardAbierto(false);
        } else if (menuName === 'dashboard') {
            setMenuDashboardAbierto(!menuDashboardAbierto);
            setMenuNuevoAbierto(false);
            setMenuStockAbierto(false);
            setMenuHistorialAbierto(false);
        }
    };

    // Verificamos si el usuario es un cajero y si NO tiene un turno activo en la BD
    const requiereApertura = auth.user.rol === 'Cajero' && !auth.turno_activo;

    // --- LÓGICA CIERRE DE TURNO ---
    const [modalCierreAbierto, setModalCierreAbierto] = useState(false);

    return (
        <div className="flex h-screen bg-[#f4f7f6] font-sans relative">
            <Head title={`${titulo} - Farmaquinta`} />

            {/* OVERLAY PARA MÓVILES */}
            {isSidebarOpen && (
                <div 
                    className="fixed inset-0 bg-black/50 z-30 md:hidden transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                ></div>
            )}

            {/* BARRA LATERAL (SIDEBAR ESTÁTICO Y RESPONSIVO) */}
            <aside className={`w-64 bg-[#232936] text-gray-300 flex flex-col h-full shadow-2xl z-40 fixed md:relative transform transition-transform duration-300 ease-in-out ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0`}>
                 
                <div className="p-6 border-b border-gray-700/50 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-bold text-white flex items-center gap-2">
                            <span className="text-[#3b82f6]">Farmaquinta</span> 
                        </h2>
                        <p className="text-xs text-gray-500 mt-1">Sucursal {auth.user.id_sucursal || 1} - Activa</p>
                    </div>
                    {/* Botón cerrar en móvil */}
                    <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-400 hover:text-white">
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
                    </button>
                </div>

                <nav className="flex-1 px-4 py-6 space-y-2">
                    <Link href="/venta" className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${url.startsWith('/venta') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}>
                        <span></span> Punto de Venta
                    </Link>
                    
                    {/* SECCIÓN NUEVO - DESPLEGABLE (Solo Administrador) */}
                {auth.user.rol === 'Administrador' && (
                <div>
                    <button 
                        onClick={() => handleToggleMenu('nuevo')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${url.startsWith('/nuevo') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span></span> Nuevo
                        </div>
                        {/* Icono de flecha que rota según el estado */}
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${menuNuevoAbierto ? 'rotate-90' : ''}`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>

                    {/* SUBMENÚ */}
                    {menuNuevoAbierto && (
                        <div className="pl-4 pr-4 py-2 space-y-1 bg-blue-900/40 rounded-b-lg mb-2">
                            <Link href="/nuevo/producto" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/nuevo/producto' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Nuevo Producto
                            </Link>
                            <Link href="/nuevo/proveedor" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/nuevo/proveedor' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Nuevo Proveedor
                            </Link>
                            <Link href="/nuevo/activar-producto" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/nuevo/activar-producto' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Activar Producto
                            </Link>
                        </div>
                    )}
                </div>
                )}
                
                {/* SECCIÓN STOCK - DESPLEGABLE */}
                <div>
                    <button 
                        onClick={() => handleToggleMenu('stock')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${url.startsWith('/stock') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            
                            <span></span> Stock
                        </div>
                        
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${menuStockAbierto ? 'rotate-90' : ''}`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>

                    {/* SUBMENÚ DE STOCK */}
                    {menuStockAbierto && (
                        <div className="pl-4 pr-4 py-2 space-y-1 bg-blue-900/40 rounded-b-lg mb-2">
                           <Link href="/stock/ingreso" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/stock/ingreso' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Ingreso de Mercadería
                            </Link>
                            <Link href="/stock/movimientos" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/stock/movimientos' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Movimiento Productos
                            </Link>
                            <Link href="/stock/gestion" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/stock/lotes' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Gestión de Lotes
                            </Link>

                            {auth.user.rol === 'Administrador' && (
                                <Link href="/stock/dinero" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/stock/dinero' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                    Movimientos caja
                                </Link>
                            )}

                            <Link href="/stock/ubicacion" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/stock/ubicacion' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Ubicación Física
                            </Link>

                        </div>
                    )}
                </div>

                {/* SECCIÓN HISTORIAL - DESPLEGABLE */}
                <div>
                    <button 
                        onClick={() => handleToggleMenu('historial')}
                        className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${url.startsWith('/historial') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}
                    >
                        <div className="flex items-center gap-3">
                            <span></span> Historial
                        </div>
                        
                        <svg 
                            className={`w-4 h-4 transition-transform duration-200 ${menuHistorialAbierto ? 'rotate-90' : ''}`} 
                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                        </svg>
                    </button>

                    {/* SUBMENÚ DE HISTORIAL */}
                    {menuHistorialAbierto && (
                        <div className="pl-4 pr-4 py-2 space-y-1 bg-blue-900/40 rounded-b-lg mb-2">
                            <Link href="/historial/ventas" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/historial/ventas' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Ventas (Boletas)
                            </Link>
                            
                            <Link href="/historial/mercaderia" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/historial/mercaderia' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Ingresos Mercadería
                            </Link>
                            
                            <Link href="/historial/movimientos-mercaderia" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/historial/movimientos-mercaderia' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Movimiento Productos
                            </Link>

                            {auth.user.rol === 'Administrador' && (
                                <Link href="/historial/movimientos-dinero" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/historial/movimientos-dinero' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                    Movimientos Caja
                                </Link>
                            )}
                            
                            <Link href="/historial/caja" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/historial/caja' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                Cierres de Caja
                            </Link>
                            
                        </div>
                    )}
                </div>
                {/* SECCIÓN DASHBOARD (BI) - DESPLEGABLE (Solo Administrador) */}
                    {auth.user.rol === 'Administrador' && (
                        <div>
                            <button 
                                onClick={() => handleToggleMenu('dashboard')}
                                className={`w-full flex items-center justify-between px-4 py-3 rounded-lg transition-colors ${url.startsWith('/dashboard') ? 'bg-[#3b82f6] text-white font-semibold' : 'hover:bg-gray-800 hover:text-white'}`}
                            >
                                <div className="flex items-center gap-3">
                                    <span></span> Inteligencia (BI)
                                </div>
                                <svg 
                                    className={`w-4 h-4 transition-transform duration-200 ${menuDashboardAbierto ? 'rotate-90' : ''}`} 
                                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                >
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7"></path>
                                </svg>
                            </button>

                            {/* SUBMENÚ */}
                            {menuDashboardAbierto && (
                                <div className="pl-4 pr-4 py-2 space-y-1 bg-blue-900/40 rounded-b-lg mb-2">
                                    <Link href="/dashboard/rendimiento" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/dashboard/rendimiento' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                        Rendimiento de Ventas
                                    </Link>
                                    <Link href="/dashboard/productos" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/dashboard/productos' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                        Inteligencia Productos
                                    </Link>
                                    <Link href="/dashboard/analisis" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/dashboard/analisis' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                        Análisis de Ventas
                                    </Link>
                                    <Link href="/dashboard/flujo" className={`block w-full text-sm py-2 px-2 rounded transition-colors ${url === '/dashboard/flujo' ? 'text-[#3b82f6] font-semibold' : 'text-white hover:text-white hover:bg-gray-800'}`}>
                                        Flujo de Caja y Stock
                                    </Link>
                                </div>
                            )}
                        </div>
                    )}

                    {/* SECCIÓN COTIZADOR (SOLO ADMIN) */}
                    {auth.user.rol === 'Administrador' && (
                        <Link 
                            href="/cotizador" 
                            className={`flex items-center space-x-3 w-full text-left py-3 px-4 rounded-lg font-medium transition-all ${
                                url.startsWith('/cotizador')
                                    ? 'bg-blue-600 text-white shadow-md'
                                    : 'text-gray-300 hover:bg-gray-800 hover:text-white'
                            }`}
                        >
                            <svg className={`w-5 h-5 ${url.startsWith('/cotizador') ? 'text-white' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                            </svg>
                            <span>Cotizador Inteligente</span>
                            <span className="ml-auto bg-blue-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">PRO</span>
                        </Link>
                    )}

                </nav>

              <div className="p-4 border-t border-gray-700/50 space-y-4">
                    {/* Nombre y rol */}
                    <div className="flex items-center gap-3 px-4">
                        <span className="w-5 flex-shrink-0"></span>
                        <div>
                            <p className="text-white font-medium text-sm">{auth.user.name}</p>
                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mt-1">
                                {auth.user.rol}
                            </p>
                        </div>
                    </div>
                    
                    {/* Botón Cerrar Turno (solo si turno activo) */}
                    {auth.turno_activo && (
                        <button 
                            onClick={() => setModalCierreAbierto(true)}
                            className="w-full flex items-center gap-3 px-4 py-2.5 text-orange-400 hover:text-orange-300 hover:bg-orange-500/10 rounded-lg transition-colors text-sm font-semibold"
                        >
                            <span className="w-5 flex-shrink-0"></span>
                            Cerrar Caja
                        </button>
                    )}

                    {/* Botón Cerrar Sesión */}
                    <Link 
                        href={route('logout')} 
                        method="post" 
                        as="button" 
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-lg transition-colors text-sm font-semibold"
                    >
                        <span className="w-5 flex-shrink-0"></span>
                        Cerrar Sesión
                    </Link>
                </div>
            </aside>

            {/* ÁREA PRINCIPAL */}
            <main className="flex-1 flex flex-col h-full overflow-hidden relative">
                {/* CABECERA (HEADER ESTÁTICO) */}
                <header className="bg-white border-b border-gray-200 h-20 flex items-center justify-between px-4 md:px-8 shadow-sm z-10 shrink-0">
                    <div className="flex items-center gap-3">
                        <button 
                            onClick={() => setIsSidebarOpen(true)}
                            className="md:hidden p-2 -ml-2 text-[#0f3b8e] hover:bg-gray-100 rounded-lg transition-colors"
                        >
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" /></svg>
                        </button>
                        <h1 className="text-xl md:text-2xl font-bold text-[#0f3b8e] truncate">{titulo}</h1>
                    </div>

                    <div className="flex items-center gap-3">
                        <div className="bg-green-50 text-green-700 border border-green-200 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1.5">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span> SII Online
                        </div>
                    </div>
                </header>

                {/* AQUÍ SE INYECTAN TUS PÁGINAS (Venta, Stock, Historial) */}
                <div className="flex-1 overflow-y-auto p-8 bg-[#f4f7f6]">
                    {children}
                </div>
            </main>

            {/* MODAL DE APERTURA DE TURNO (DIFUMINADO DEL FONDO) */}
            <ModalAbrirTurno 
                isVisible={requiereApertura} 
                auth={auth} 
            />

            {/* MODAL DE CIERRE DE TURNO */}
            <ModalCerrarTurno 
                isVisible={modalCierreAbierto} 
                onClose={() => setModalCierreAbierto(false)} 
            />
        </div>
    );
}