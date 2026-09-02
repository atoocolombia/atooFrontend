import { createBrowserRouter } from "react-router";
import { AppLayout } from "./AppLayout";
import { RequireAuth } from "./components/RequireAuth";
import { ClientPortalGuard } from "./components/ClientPortalGuard";
import { Root } from "./Root";
import { ApplicationPage } from "./pages/ApplicationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdvisorDashboard } from "./pages/AdvisorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AnalystDashboard } from "./pages/AnalystDashboard";
import { WorkshopDashboard } from "./pages/WorkshopDashboard";
import { DeliveryConfirmPage } from "./pages/DeliveryConfirmPage";
import { WaitingDeliveryPage } from "./pages/WaitingDeliveryPage";
import { AccountSetupPage } from "./pages/AccountSetupPage";

function ErrorBoundary() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Error</h1>
        <p className="text-gray-600">Algo salió mal. Por favor, recarga la página.</p>
      </div>
    </div>
  );
}

export const router = createBrowserRouter([
  {
    path: "/",
    Component: AppLayout,
    errorElement: <ErrorBoundary />,
    children: [
      {
        index: true,
        Component: Root,
      },
      {
        path: "solicitud",
        element: (
          <RequireAuth>
            <ClientPortalGuard>
              <ApplicationPage />
            </ClientPortalGuard>
          </RequireAuth>
        ),
      },
      {
        path: "espera-entrega",
        element: (
          <RequireAuth allowedTypes={['USER']}>
            <ClientPortalGuard>
              <WaitingDeliveryPage />
            </ClientPortalGuard>
          </RequireAuth>
        ),
      },
      {
        path: "dashboard",
        element: (
          <RequireAuth allowedTypes={['USER']}>
            <ClientPortalGuard>
              <DashboardPage />
            </ClientPortalGuard>
          </RequireAuth>
        ),
      },
      {
        path: "asesor",
        element: (
          <RequireAuth allowedTypes={['ADVISOR']}>
            <AdvisorDashboard />
          </RequireAuth>
        ),
      },
      {
        path: "admin",
        element: (
          <RequireAuth allowedTypes={['ADMIN']}>
            <AdminDashboard />
          </RequireAuth>
        ),
      },
      {
        path: "analista",
        element: (
          <RequireAuth allowedTypes={['ANALYST']}>
            <AnalystDashboard />
          </RequireAuth>
        ),
      },
      {
        path: "entrega/confirmar/:token",
        Component: DeliveryConfirmPage,
      },
      {
        path: "activar-cuenta/:token",
        Component: AccountSetupPage,
      },
      {
        path: "taller",
        element: (
          <RequireAuth allowedTypes={['WORKSHOP']}>
            <WorkshopDashboard />
          </RequireAuth>
        ),
      },
    ],
  },
]);
