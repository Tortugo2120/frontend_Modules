"use client";

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema } from '../Validations/validation';
import { z } from 'zod';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

type LoginFormData = z.infer<typeof loginSchema>;

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export default function Login() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      usuario: '',
      password: '',
      rememberMe: false
    }
  });

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const onSubmit = (data: LoginFormData) => {
    setIsLoading(true);
    showToastMessage('Iniciando sesión...', 'success');

    setTimeout(() => {
      // Guardar datos de autenticación
      login({ usuario: data.usuario, rememberMe: data.rememberMe });
      setIsLoading(false);
      navigate('/dashboard');
    }, 1500);
  };

  const handleUsuarioInput = (e: React.FormEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    input.value = input.value.replace(/[^0-9]/g, '').slice(0, 8);
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="card bg-base-100 shadow-2xl">
          <div className="card-body">

            {/* Encabezado */}
            <div className="text-center mb-6">
              <div className="avatar placeholder mb-4 flex justify-center">
                <div className="bg-primary text-primary-content rounded-full w-20 flex justify-center items-center">
                  <i className="fas fa-user-shield text-3xl"></i>
                </div>
              </div>
              <h2 className="card-title text-3xl font-bold justify-center">Registro civil</h2>
              <p className="text-base-content/60">Inicia sesión en tu cuenta</p>
            </div>

            {/* Formulario */}
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              {/* DNI */}
              <div className="form-control">
                <label className="label mb-1.5">
                  <span className="label-text font-semibold">
                    <i className="fa-solid fa-user"></i> Usuario
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className={`input input-bordered w-full outline-none ${
                    errors.usuario ? 'border-error' : 'border-gray-300'
                  }`}
                  {...register('usuario')}
                  onInput={handleUsuarioInput}
                />
                {errors.usuario && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.usuario.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Contraseña */}
              <div className="form-control">
                <label className="label mb-1.5">
                  <span className="label-text font-semibold">
                    <i className="fas fa-lock mr-2"></i>Contraseña
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    className={`input input-bordered w-full pr-12 outline-none ${
                      errors.password ? 'border-error' : 'border-gray-300'
                    }`}
                    {...register('password')}
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && (
                  <label className="label">
                    <span className="label-text-alt text-error">
                      {errors.password.message}
                    </span>
                  </label>
                )}
              </div>

              {/* Recordarme */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="default-checkbox checkbox-primary w-4 h-4"
                    {...register('rememberMe')}
                  />
                  <span className="label-text">Recordarme</span>
                </label>
              </div>

              {/* Botón Enviar */}
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary btn-block" disabled={isLoading}>
                  {isLoading ? (
                    <span className="loading loading-dots loading-xl"></span>
                  ) : (
                    <>
                      <i className="fas fa-sign-in-alt mr-2"></i>
                      Iniciar Sesión
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Toast */}
        {toast && (
          <div className="toast toast-top toast-end">
            <div className={`alert ${toast.type === 'success' ? 'alert-success' : 'alert-error'}`}>
              <span>{toast.message}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}