// UsuarioServices.tsx
const API_BASE_URL = 'http://localhost:8080'; // Cambia esto a tu URL base

interface Usuario {
  id: number;
  dni: string;
  username: string;
  name: string;
  role: string;
  permissions?: Permiso[];
}

interface Permiso {
  moduleId: number;
  moduleName: string;
  access: string[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const UsuarioServices = {
  // Obtener usuario por username
  getUserByUsername: async (username: string): Promise<ApiResponse<Usuario>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/username/${username}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // Buscar usuarios por nombre (si tienes este endpoint)
  searchUsersByName: async (name: string): Promise<ApiResponse<Usuario[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users/search?name=${encodeURIComponent(name)}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error al buscar usuarios:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // Actualizar permisos de usuario
  updateUserPermissions: async (userId: number, permissions: any): Promise<ApiResponse<any>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/user/${userId}/permissions`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ permissions }),
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error al actualizar permisos:', error);
      return {
        success: false,
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },

  // Obtener todos los usuarios
  getAllUsers: async (): Promise<ApiResponse<Usuario[]>> => {
    try {
      const response = await fetch(`${API_BASE_URL}/api/users`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }

      const data = await response.json();
      return {
        success: true,
        data: data,
      };
    } catch (error) {
      console.error('Error al obtener usuarios:', error);
      return {
        success: false,
        data: [],
        message: error instanceof Error ? error.message : 'Error desconocido',
      };
    }
  },
};

export default UsuarioServices;