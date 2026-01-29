import { useState } from 'react';

interface ToastMessage {
  message: string;
  type: 'success' | 'error';
}

export default function Login() {
  const [usuario, setUsuario] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [toast, setToast] = useState<ToastMessage | null>(null);

  const handleUsuarioChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value.length <= 8) {
      setUsuario(value);
    }
  };

  const handleTogglePassword = () => {
    setShowPassword(!showPassword);
  };

  const showToastMessage = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3000);
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    // Validaciones
    if (usuario.length !== 8) {
      showToastMessage('El usuario debe tener 8 dígitos', 'error');
      return;
    }

    if (password.length < 4) {
      showToastMessage('La contraseña es muy corta', 'error');
      return;
    }

    showToastMessage('Iniciando sesión...', 'success');
    console.log('Usuario:', usuario);
    console.log('Password:', password);
    console.log('Recordarme:', rememberMe);

    // Simular redirección después de 2 segundos
    setTimeout(() => {
      window.location.href = 'dashboard.html';
      console.log('Redirigiendo al dashboard...');
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900 flex items-center justify-center p-4">
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
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* DNI */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    <i className="fa-solid fa-user"></i>Usuario
                  </span>
                </label>
                <input
                  type="text"
                  placeholder="Ingresa tu usuario"
                  className="input input-bordered w-full outline-none border-gray-300"
                  value={usuario}
                  onChange={handleUsuarioChange}
                  required
                />
                
              </div>

              {/* Contraseña */}
              <div className="form-control">
                <label className="label">
                  <span className="label-text font-semibold">
                    <i className="fas fa-lock mr-2"></i>Contraseña
                  </span>
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Ingresa tu contraseña"
                    className="input input-bordered w-full pr-12 outline-none border-gray-300"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={handleTogglePassword}
                    className="absolute right-3 top-1/2 -translate-y-1/2 btn btn-ghost btn-sm btn-circle"
                  >
                    <i className={`fas ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
              </div>

              {/* Recordarme */}
              <div className="form-control">
                <label className="label cursor-pointer justify-start gap-3">
                  <input
                    type="checkbox"
                    className="default-checkbox checkbox-primary checkbox-sm"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="label-text">Recordarme</span>
                </label>
              </div>

              {/* Botón Enviar */}
              <div className="form-control mt-6">
                <button type="submit" className="btn btn-primary btn-block">
                  <i className="fas fa-sign-in-alt mr-2"></i>
                  Iniciar Sesión
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
