import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { DashboardContent } from './components/DashboardContent';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { SidebarProvider } from './contexts/SidebarContext';
import { SettingsPage } from './pages/SettingsPage';
import { DocumentCompressorPage } from './pages/DocumentCompressorPage';
import { XmlFixerPage } from './pages/XmlFixerPage';
import { PayersPage } from './pages/zus/PayersPage';

// Root layout component
function RootLayout() {
  return (
    <SidebarProvider>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
        <Sidebar />
        <main className="flex-1 overflow-y-auto">
          <Header />
          <Outlet />
        </main>
      </div>
    </SidebarProvider>
  );
}

// Create root route
const rootRoute = createRootRoute({
  component: RootLayout,
});

// Create routes
const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  component: DashboardContent,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

const xmlFixerRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/xml-fixer',
  component: XmlFixerPage,
});

const documentCompressorRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/tools/document-compressor',
  component: DocumentCompressorPage,
});

const zusPayersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/zus/payers',
  component: PayersPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  settingsRoute,
  xmlFixerRoute,
  documentCompressorRoute,
  zusPayersRoute,
]);

// Create router
export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
