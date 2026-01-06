import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";

import { router } from "@/routes";
import { useAuthBootstrap } from "@/features/auth/hooks/use-auth-bootstrap";

export function App() {
  useAuthBootstrap();

  return (
    <>
      <RouterProvider router={router} />
      <Toaster position="top-right" richColors closeButton />
    </>
  );
}

export default App;
