import { Head, Link, useForm } from '@inertiajs/react';
import { useState } from 'react';

export default function Login({ status, canResetPassword }) {
    const { data, setData, post, processing, errors, reset } = useForm({
        email: '',
        password: '',
        remember: false,
    });

    const [mostrarPassword, setMostrarPassword] = useState(false);

    const submit = (e) => {
        e.preventDefault();
        post(route('login'), {
            onFinish: () => reset('password'),
        });
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[#f4f7f6] p-4 font-sans absolute inset-0 z-50 w-full">
            <Head title="Iniciar Sesión - RxPOS" />

            {/* Contenedor de la Tarjeta */}
            <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col border border-gray-100">
                
                {/* Cabecera Azul */}
                <div className="bg-[#0f3b8e] text-white p-8 text-center flex flex-col items-center">
                    <div className="mb-4 bg-white/10 p-4 rounded-2xl shadow-inner">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight">Control Farma</h1>
                    <p className="text-blue-200 text-sm mt-2 font-medium">Sistema para la Gestión Farmacéutica</p>
                </div>

                {/* Cuerpo del Formulario */}
                <div className="p-8">
                    {status && <div className="mb-4 font-medium text-sm text-green-600 text-center">{status}</div>}

                    <form onSubmit={submit}>
                        {/* Campo Correo / ID */}
                        <div className="mb-5">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Ingrese usuario</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    
                                </div>
                                <input
                                    type="email"
                                    value={data.email}
                                    className="w-full pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-colors bg-gray-50 text-gray-800"
                                    placeholder="ej: farma-0822"
                                    onChange={(e) => setData('email', e.target.value)}
                                    required
                                />
                            </div>
                            {errors.email && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.email}</p>}
                        </div>

                        {/* Campo Contraseña */}
                        <div className="mb-6">
                            <label className="block text-sm font-bold text-gray-700 mb-2">Contraseña</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    
                                </div>
                                <input
                                    type={mostrarPassword ? 'text' : 'password'}
                                    value={data.password}
                                    className="w-full pr-12 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#0f3b8e] focus:border-[#0f3b8e] transition-colors bg-gray-50 text-gray-800 tracking-wider"
                                    placeholder="••••••••"
                                    onChange={(e) => setData('password', e.target.value)}
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setMostrarPassword(!mostrarPassword)}
                                    className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-[#0f3b8e]"
                                >
                                    {mostrarPassword ? 'Ocultar' : 'Ver'}
                                </button>
                            </div>
                            {errors.password && <p className="text-red-500 text-xs mt-1 font-semibold">{errors.password}</p>}
                        </div>

                        {/* Botón Principal */}
                        <button
                            type="submit"
                            disabled={processing}
                            className={`w-full bg-[#0f3b8e] hover:bg-[#0a2966] text-white font-bold py-3.5 px-4 rounded-lg transition-all flex justify-center items-center gap-2 shadow-md hover:shadow-lg ${processing && 'opacity-75'}`}
                        >
                            Iniciar Sesión <span>➜</span>
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}