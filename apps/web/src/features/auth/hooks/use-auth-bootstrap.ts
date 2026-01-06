import { useEffect } from "react";

import { useAuthStore } from "@/features/auth/store/auth-store";
import { getCurrentUser } from "@/features/auth/api/me";

export function useAuthBootstrap() {
  useEffect(() => {
    let active = true;

    const { setUser, clearUser, setHydrated } = useAuthStore.getState();

    async function bootstrap() {
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

    bootstrap();

    return () => {
      active = false;
    };
  }, []);
}
