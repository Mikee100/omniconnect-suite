import { useAuthStore } from '@/state/authStore';
import { login as apiLogin, logout as apiLogout } from '@/api/auth';

export const useAuth = () => {
  const {
    user,
    token,
    isAuthenticated,
    login: storeLogin,
    logout: storeLogout,
    setUser,
  } = useAuthStore();

  const login = async (email: string, password: string) => {
    try {
      const response = await apiLogin(email, password);
      storeLogin(response.token, response.user);
      return { success: true };
    } catch (error) {
      return { success: false, error: error.message };
    }
  };

  const logout = async () => {
    try {
      await apiLogout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      storeLogout();
    }
  };

  const refreshToken = async () => {
    // Implement token refresh logic if needed
    // This would typically call an API endpoint to refresh the token
  };

  return {
    user,
    token,
    isAuthenticated,
    login,
    logout,
    refreshToken,
    setUser,
  };
};
