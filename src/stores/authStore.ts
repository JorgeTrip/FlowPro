// © 2026 J.O.T. (Jorge Osvaldo Tripodi) - Todos los derechos reservados
import { create } from 'zustand';
import { onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export interface UsuarioAuth {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
}

interface AuthState {
  user: UsuarioAuth | null;
  loading: boolean;
  error: string | null;
  setUser: (user: UsuarioAuth | null) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  inicializarAuth: () => () => void;
}

export const useAuthStore = create<AuthState>()((set) => ({
  user: null,
  loading: true,
  error: null,

  setUser: (user) => set({ user, loading: false }),
  setLoading: (loading) => set({ loading }),
  setError: (error) => set({ error }),

  inicializarAuth: () => {
    set({ loading: true });
    const unsubscribe = onAuthStateChanged(
      auth,
      (firebaseUser: FirebaseUser | null) => {
        if (firebaseUser) {
          set({
            user: {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'Usuario',
              photoURL: firebaseUser.photoURL,
            },
            loading: false,
            error: null,
          });
        } else {
          set({ user: null, loading: false, error: null });
        }
      },
      (error) => {
        console.error('Error en cambio de estado de auth:', error);
        set({ user: null, loading: false, error: error.message });
      }
    );

    return unsubscribe;
  },
}));
