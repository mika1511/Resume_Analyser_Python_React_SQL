// Backend auth integration
import { authAPI, User } from './api';

const TOKEN_KEY = 'access_token';

export function getStoredUser(): User | null {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) return null;

  try {
    // Decode JWT payload to get user info (simple decode, not secure validation)
    const payload = JSON.parse(atob(token.split('.')[1]));
    return {
      id: payload.sub,
      name: payload.name || 'User', // Backend might not include name in token
      email: payload.email || '',
    };
  } catch {
    return null;
  }
}

export async function signup(name: string, email: string, password: string): Promise<User> {
  try {
    const response = await authAPI.register(name, email, password);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    return getStoredUser()!;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Registration failed');
  }
}

export async function login(email: string, password: string): Promise<User> {
  try {
    const response = await authAPI.login(email, password);
    localStorage.setItem(TOKEN_KEY, response.access_token);
    return getStoredUser()!;
  } catch (error: any) {
    throw new Error(error.response?.data?.detail || 'Login failed');
  }
}

export function logout(): void {
  localStorage.removeItem(TOKEN_KEY);
}
