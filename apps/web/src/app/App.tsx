import { useEffect } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { router } from "@/routes";
import { getCurrentUser } from "@/features/auth/api/me";
import { useAuthStore } from "@/features/auth/store/auth-store";

export function App() {
  useEffect(() => {
    let active = true;

    const { setUser, clearUser, setHydrated } = useAuthStore.getState();

    async function bootstrapAuth() {
      try {
        const user = await getCurrentUser();
        if (active) {
          setUser(user);
        }
      } catch {
        if (active) {
          clearUser();
        }
      } finally {
        if (active) {
          setHydrated(true);
        }
      }
    }

    bootstrapAuth();

    return () => {
      active = false;
    };
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
