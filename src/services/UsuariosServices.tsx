// UsuarioServices.tsx
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8080';

interface UserModule {
  moduleId: string;
  ModuleName: string;
}

interface Usuario {
  userId: string;
  userName: string;
  roleId: string;
  roleName: string;
  officeName: string;
  modules: UserModule[];
}

interface Module {
  id_modulo: string;
  nombre_modulo: string;
}

interface ModulesResponse {
  modules: Module[];
}

interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
}

export const UsuarioServices = {
  getUserById: async (userId: string): Promise<ApiResponse<Usuario>> => {
    try {
      const response = await axios.get<Usuario>(`${API_BASE_URL}/api/user/${userId}`);
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error al obtener usuario:', error);
      return {
        success: false,
        message: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Error desconocido',
      };
    }
  },

  getAllModules: async (): Promise<ApiResponse<Module[]>> => {
    try {
      const response = await axios.get<ModulesResponse>(`${API_BASE_URL}/modules/`);
      return {
        success: true,
        data: response.data.modules,
      };
    } catch (error) {
      console.error('Error al obtener módulos:', error);
      return {
        success: false,
        data: [],
        message: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Error desconocido',
      };
    }
  },

  updateUserPermission: async (
    userId: string, 
    moduleId: string, 
    hasPermission: boolean
  ): Promise<ApiResponse<any>> => {
    try {

      const response = await axios.post(`${API_BASE_URL}/api/user/permissions`, {
        userId,
        moduleId,
        hasPermission,
      });
      
      return {
        success: true,
        data: response.data,
      };
    } catch (error) {
      console.error('Error al actualizar permiso:', error);
      return {
        success: false,
        message: axios.isAxiosError(error) 
          ? error.response?.data?.message || error.message 
          : 'Error desconocido',
      };
    }
  },
};

export default UsuarioServices;