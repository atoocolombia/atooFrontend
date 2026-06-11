import { createBrowserRouter } from "react-router";
import { Root } from "./Root";
import { ApplicationPage } from "./pages/ApplicationPage";
import { DashboardPage } from "./pages/DashboardPage";
import { AdvisorDashboard } from "./pages/AdvisorDashboard";
import { AdminDashboard } from "./pages/AdminDashboard";
import { AnalystDashboard } from "./pages/AnalystDashboard";

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
    Component: Root,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/solicitud",
    Component: ApplicationPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/dashboard",
    Component: DashboardPage,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/asesor",
    Component: AdvisorDashboard,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/admin",
    Component: AdminDashboard,
    errorElement: <ErrorBoundary />,
  },
  {
    path: "/analista",
    Component: AnalystDashboard,
    errorElement: <ErrorBoundary />,
  },
]);