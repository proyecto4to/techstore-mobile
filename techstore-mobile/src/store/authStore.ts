import { create } from 'zustand';

import { setSessionExpiredHandler } from '@/api/sessionEvents';
import type { UsuarioResponse } from '@/api/generated';
import { normalizeApiError } from '@/api/errors';
import type { LoginForm, RegisterForm } from '@/features/auth/schemas/authForms';
import * as authService from '@/features/auth/services/authService';
import { deactivateCurrentDevice } from '@/features/notifications/services/pushService';

type AuthState = {
  user: UsuarioResponse | null;
  initialized: boolean;
  initializing: boolean;
  submitting: boolean;
  error: string | null;
  bootstrap: () => Promise<void>;
  login: (values: LoginForm) => Promise<boolean>;
  register: (values: RegisterForm) => Promise<boolean>;
  logout: () => Promise<boolean>;
  expire: () => void;
  clearError: () => void;
};

export const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  initialized: false,
  initializing: false,
  submitting: false,
  error: null,
  bootstrap: async () => {
    if (get().initialized || get().initializing) return;
    set({ initializing: true, error: null });
    try {
      const session = await authService.restoreSession();
      set({ user: session?.usuario ?? null });
    } catch {
      set({ user: null });
    } finally {
      set({ initialized: true, initializing: false });
    }
  },
  login: async (values) => {
    set({ submitting: true, error: null });
    try {
      const session = await authService.login(values);
      set({ user: session.usuario, submitting: false });
      return true;
    } catch (error) {
      set({ error: normalizeApiError(error).message, submitting: false });
      return false;
    }
  },
  register: async ({ confirmPassword: _confirmPassword, ...values }) => {
    set({ submitting: true, error: null });
    try {
      const session = await authService.register(values);
      set({ user: session.usuario, submitting: false });
      return true;
    } catch (error) {
      set({ error: normalizeApiError(error).message, submitting: false });
      return false;
    }
  },
  logout: async () => {
    set({ submitting: true, error: null });
    await deactivateCurrentDevice();
    const revokedOnServer = await authService.logout();
    set({ user: null, submitting: false });
    return revokedOnServer;
  },
  expire: () => set({ user: null, error: 'Tu sesión venció. Volvé a iniciar sesión.' }),
  clearError: () => set({ error: null }),
}));

setSessionExpiredHandler(() => useAuthStore.getState().expire());
