/**
 * Auth Service Layer
 * 
 * This service handles authentication operations with mocked API responses.
 * All API calls are structured for easy integration with a real backend.
 * 
 * To integrate with a real API:
 * 1. Replace the mock responses with actual fetch() calls
 * 2. Update the API_BASE_URL constant
 * 3. Handle real authentication tokens
 */

// Types
export interface User {
  id: number;
  name: string;
  email: string;
  phone: string;
  photo?: string;
  userType: 'funeral_home' | 'family';
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  userType: 'funeral_home' | 'family';
  // Funeral home specific fields
  companyName?: string;
  cnpj?: string;
  address?: string;
}

export interface LoginData {
  email: string;
  password: string;
  userType: 'funeral_home' | 'family';
}

export interface ForgotPasswordData {
  email: string;
  userType: 'funeral_home' | 'family';
}

export interface ResetPasswordData {
  token: string;
  password: string;
  confirmPassword: string;
}

export interface ChangePasswordData {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UpdateProfileData {
  name: string;
  email: string;
  phone: string;
  photo?: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  user?: User;
  token?: string;
}

// Simulated delay to mimic API latency
const simulateDelay = (ms: number = 800) => new Promise(resolve => setTimeout(resolve, ms));

// Mock user storage (simulates session)
let currentUser: User | null = null;

class AuthService {
  /**
   * Register a new user
   * POST /api/auth/register
   */
  async register(data: RegisterData): Promise<AuthResponse> {
    await simulateDelay();
    
    // TODO: Replace with actual API call
    // return fetch('/api/auth/register', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());

    // Validation
    if (!data.email || !data.password || !data.name) {
      return {
        success: false,
        message: 'Por favor, preencha todos os campos obrigatórios.'
      };
    }

    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'As senhas não coincidem.'
      };
    }

    if (data.password.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres.'
      };
    }

    // Mock: Check if email already exists
    if (data.email === 'existente@email.com') {
      return {
        success: false,
        message: 'Este e-mail já está cadastrado.'
      };
    }

    // Mock successful registration
    const newUser: User = {
      id: Math.floor(Math.random() * 1000) + 100,
      name: data.name,
      email: data.email,
      phone: data.phone,
      userType: data.userType,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    currentUser = newUser;

    return {
      success: true,
      message: 'Cadastro realizado com sucesso! Bem-vindo ao Portal da Lembrança.',
      user: newUser,
      token: 'mock_jwt_token_' + newUser.id
    };
  }

  /**
   * Login user
   * POST /api/auth/login
   */
  async login(data: LoginData): Promise<AuthResponse> {
    await simulateDelay();

    // TODO: Replace with actual API call
    // return fetch('/api/auth/login', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());

    if (!data.email || !data.password) {
      return {
        success: false,
        message: 'Por favor, preencha e-mail e senha.'
      };
    }

    // Mock successful login
    const mockUser: User = {
      id: 1,
      name: data.userType === 'funeral_home' ? 'Funerária Paz Eterna' : 'Ana Carolina Santos',
      email: data.email,
      phone: '(81) 99999-0000',
      userType: data.userType,
      isActive: true,
      createdAt: '2024-01-15T10:00:00Z',
      updatedAt: new Date().toISOString()
    };

    currentUser = mockUser;

    return {
      success: true,
      message: 'Login realizado com sucesso!',
      user: mockUser,
      token: 'mock_jwt_token_' + mockUser.id
    };
  }

  /**
   * Logout user
   * POST /api/auth/logout
   */
  async logout(): Promise<AuthResponse> {
    await simulateDelay(300);

    // TODO: Replace with actual API call
    // return fetch('/api/auth/logout', { method: 'POST' }).then(r => r.json());

    currentUser = null;

    return {
      success: true,
      message: 'Logout realizado com sucesso.'
    };
  }

  /**
   * Request password reset
   * POST /api/auth/forgot-password
   */
  async forgotPassword(data: ForgotPasswordData): Promise<AuthResponse> {
    await simulateDelay(1000);

    // TODO: Replace with actual API call
    // return fetch('/api/auth/forgot-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());

    if (!data.email) {
      return {
        success: false,
        message: 'Por favor, informe seu e-mail.'
      };
    }

    // Mock: Always return success (don't reveal if email exists)
    return {
      success: true,
      message: 'Se este e-mail estiver cadastrado, você receberá um link para redefinir sua senha.'
    };
  }

  /**
   * Reset password with token
   * POST /api/auth/reset-password
   */
  async resetPassword(data: ResetPasswordData): Promise<AuthResponse> {
    await simulateDelay();

    // TODO: Replace with actual API call
    // return fetch('/api/auth/reset-password', {
    //   method: 'POST',
    //   headers: { 'Content-Type': 'application/json' },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());

    if (!data.token) {
      return {
        success: false,
        message: 'Token de recuperação inválido ou expirado.'
      };
    }

    if (data.password !== data.confirmPassword) {
      return {
        success: false,
        message: 'As senhas não coincidem.'
      };
    }

    if (data.password.length < 6) {
      return {
        success: false,
        message: 'A senha deve ter pelo menos 6 caracteres.'
      };
    }

    return {
      success: true,
      message: 'Senha redefinida com sucesso! Você já pode fazer login.'
    };
  }

  /**
   * Change password (authenticated user)
   * POST /api/auth/change-password
   */
  async changePassword(data: ChangePasswordData): Promise<AuthResponse> {
    await simulateDelay();

    // TODO: Replace with actual API call
    // return fetch('/api/auth/change-password', {
    //   method: 'POST',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());

    if (!data.currentPassword) {
      return {
        success: false,
        message: 'Por favor, informe sua senha atual.'
      };
    }

    if (data.newPassword !== data.confirmPassword) {
      return {
        success: false,
        message: 'As novas senhas não coincidem.'
      };
    }

    if (data.newPassword.length < 6) {
      return {
        success: false,
        message: 'A nova senha deve ter pelo menos 6 caracteres.'
      };
    }

    // Mock: Check if current password is correct
    if (data.currentPassword === 'senhaerrada') {
      return {
        success: false,
        message: 'Senha atual incorreta.'
      };
    }

    return {
      success: true,
      message: 'Senha alterada com sucesso!'
    };
  }

  /**
   * Update user profile
   * PUT /api/auth/profile
   */
  async updateProfile(data: UpdateProfileData): Promise<AuthResponse> {
    await simulateDelay();

    // TODO: Replace with actual API call
    // return fetch('/api/auth/profile', {
    //   method: 'PUT',
    //   headers: { 
    //     'Content-Type': 'application/json',
    //     'Authorization': `Bearer ${token}`
    //   },
    //   body: JSON.stringify(data)
    // }).then(r => r.json());

    if (!data.name || !data.email) {
      return {
        success: false,
        message: 'Nome e e-mail são obrigatórios.'
      };
    }

    if (currentUser) {
      currentUser = {
        ...currentUser,
        ...data,
        updatedAt: new Date().toISOString()
      };
    }

    return {
      success: true,
      message: 'Perfil atualizado com sucesso!',
      user: currentUser || undefined
    };
  }

  /**
   * Get current user
   * GET /api/auth/me
   */
  async getCurrentUser(): Promise<User | null> {
    await simulateDelay(300);

    // TODO: Replace with actual API call
    // return fetch('/api/auth/me', {
    //   headers: { 'Authorization': `Bearer ${token}` }
    // }).then(r => r.json());

    return currentUser;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return currentUser !== null;
  }

  /**
   * Set mock user (for demo purposes)
   */
  setMockUser(user: User): void {
    currentUser = user;
  }
}

// Export singleton instance
export const authService = new AuthService();

// Export default for convenience
export default authService;
