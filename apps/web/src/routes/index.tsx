import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
} from "react-router-dom";

import { DashboardLayout } from "@/layouts/dashboard-layout";
import { AuthLayout } from "@/layouts/auth-layout";
import { HomePage } from "@/features/workspace/pages/home-page";
import { CallsPage } from "@/features/workspace/pages/calls-page";
import { ContactsPage } from "@/features/workspace/pages/contacts-page";
import { LoginPage } from "@/features/auth/pages/login-page";
import { RegisterPage } from "@/features/auth/pages/register-page";
import { NotFoundRoute } from "@/pages/not-found";
import { ProtectedRoute } from "@/routes/components/protected-route";
import { GuestRoute } from "@/routes/components/guest-route";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <>
      <Route element={<ProtectedRoute />}>
        <Route element={<DashboardLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/calls" element={<CallsPage />} />
          <Route path="/contacts" element={<ContactsPage />} />
        </Route>
      </Route>
      <Route element={<GuestRoute />}>
        <Route path="/auth" element={<AuthLayout />}>
          <Route index element={<LoginPage />} />
          <Route path="register" element={<RegisterPage />} />
        </Route>
      </Route>
      <Route path="*" element={<NotFoundRoute />} />
    </>,
  ),
);
