import { Outlet, createRootRoute, createRoute, createRouter } from '@tanstack/react-router';
import { DashboardContent } from './components/DashboardContent';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { AccountPage } from './pages/AccountPage';
import { AnalyticsPage } from './pages/AnalyticsPage';
import { ChatPage } from './pages/ChatPage';
import { CustomersPage } from './pages/CustomersPage';
import { EmailPage } from './pages/EmailPage';
import { IntegrationPage } from './pages/IntegrationPage';
import { MembersPage } from './pages/MembersPage';
import { OrdersPage } from './pages/OrdersPage';
import { PerformancePage } from './pages/PerformancePage';
import { ProductsPage } from './pages/ProductsPage';
import { SettingsPage } from './pages/SettingsPage';

// Root layout component
function RootLayout() {
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-950">
      <Sidebar />
      <main className="flex-1 overflow-y-auto">
        <Header />
        <Outlet />
      </main>
    </div>
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

const productsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/products',
  component: ProductsPage,
});

const ordersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/orders',
  component: OrdersPage,
});

const customersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/customers',
  component: CustomersPage,
});

const chatRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/chat',
  component: ChatPage,
});

const emailRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/email',
  component: EmailPage,
});

const analyticsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/analytics',
  component: AnalyticsPage,
});

const integrationRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/integration',
  component: IntegrationPage,
});

const performanceRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/performance',
  component: PerformancePage,
});

const accountRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/account',
  component: AccountPage,
});

const membersRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/members',
  component: MembersPage,
});

const settingsRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/settings',
  component: SettingsPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  productsRoute,
  ordersRoute,
  customersRoute,
  chatRoute,
  emailRoute,
  analyticsRoute,
  integrationRoute,
  performanceRoute,
  accountRoute,
  membersRoute,
  settingsRoute,
]);

// Create router
export const router = createRouter({ routeTree });

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
