import { create } from 'zustand';

function parseJwt(token) {
  if (!token) return null;
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(decodeURIComponent(atob(base64).split('').map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2)).join('')));
    return {
      userId: payload.userId || payload.sub || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'],
      email: payload.email || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'],
      role: payload.role || payload['http://schemas.microsoft.com/w2008/06/identity/claims/role'],
      name: payload.name || payload.unique_name || payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/name']
    };
  } catch (e) { return null; }
}

const initialToken = localStorage.getItem('horr_token');
const initialUser = parseJwt(initialToken);

export const useAuthStore = create((set) => ({
  user: initialUser,
  token: initialToken,
  role: initialUser?.role || null,
  isAuthenticated: !!initialToken,
  login: (token, user) => {
    localStorage.setItem('horr_token', token);
    set({ token, user, role: user?.role, isAuthenticated: true });
  },
  logout: () => {
    localStorage.removeItem('horr_token');
    set({ token: null, user: null, role: null, isAuthenticated: false });
  }
}));
