import { memo } from 'react';
import { Navigate, createBrowserRouter, RouterProvider } from 'react-router-dom';

// LAYOUTS
import {
  // PAGES
  AgentsPage,
  LoginPage,
  RegisterPage,
  VerifyCodePage,
  NewPasswordPage,
  ResetPasswordPage,
  AccountMembers,
  APIKeys,
  AgentPage,
  AgentSharePage,
  AgentCardPage,
  BasePage,
  ProjectPage,
  BasesPage,
  ExecutionsPage,
  DashboardPage,
  UsagePage,
  IntegrationCreator,
  MemberPage,
  MediaPage,
  UserProfilePage,
  UserAccountPage,
  AdminPage,
  MarketplacePage,
  TemplatePage,
  PermissionDeniedPage,
  IntegrationPage,
  StandaloneWorkflowPage,
  //
  Page500,
  Page403,
  Page404,
  PricingPage,
  RemixPage,
  ComingSoonPage,
  MaintenancePage,
  SuperAdminMain,
  InternalUtils,
  ExternalUtils,
  InterfacesPage,
  InterfacePage,
  ReferralsPage,
  StandaloneBasePage,
  OverallActivityPage,
  AccountPage,
  AccountsPage,
  RoomPage,
  Terms,
  Privacy,
} from './elements.jsx';
import AuthGuard from '../auth/AuthGuard.jsx';
import GuestGuard from '../auth/GuestGuard.jsx';
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
import RootBoundary from './components/RootBoundary.jsx';
import ProjectLayout from '../layouts/dashboard/ProjectLayout.jsx';
import SuperAdminLayout from '../layouts/superadmin/SuperAdminLayout.jsx';

// Detect if we're in a mobile environment
const isMobile = window.innerWidth <= 768 || /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

// ----------------------------------------------------------------------

const Router = () => {
  const router = createBrowserRouter([
    // Auth
    {
      path: 'auth',
      children: [
        {
          path: 'login',
          element: (
            <GuestGuard>
              <LoginPage />
            </GuestGuard>
          ),
        },
        {
          path: 'register',
          element: (
            <GuestGuard>
              <RegisterPage />
            </GuestGuard>
          ),
        },
        {
          element: <CompactLayout />,
          children: [
            { path: 'reset-password', element: <ResetPasswordPage /> },
            { path: 'new-password', element: <NewPasswordPage /> },
            { path: 'verify', element: <VerifyCodePage /> },
          ],
        },
      ],
    },
    {
      path: 'room/:roomId',
      element: (
        <AuthGuard requireAuth={true}>
          <RoomPage />
        </AuthGuard>
      ),
      ErrorBoundary: RootBoundary,
    },
    // Public Agent Share Page
    {
      path: 'agents/:agentId/share',
      element: <AgentSharePage />,
      ErrorBoundary: RootBoundary,
    },
    // Public Agent Card Page
    {
      path: 'agent/:agentId/card',
      element: <AgentCardPage />,
      ErrorBoundary: RootBoundary,
    },
    {
      path: 'xsup',
      element: (
        <AuthGuard requireAuth={true}>
          <SuperAdminLayout />
        </AuthGuard>
      ),
      children: [
        { element: <SuperAdminMain />, index: true },
        { path: 'internal', element: <InternalUtils /> },
        { path: 'external', element: <ExternalUtils /> },
        { path: 'creator', element: <IntegrationCreator /> },
        { path: 'activity', element: <OverallActivityPage /> },
      ],
    },
    // App
    {
      path: 'project',
      ErrorBoundary: RootBoundary,
      element: (
        <AuthGuard requireAuth={true}>
          <ProjectLayout />
        </AuthGuard>
      ),
      children: [
        {
          path: ':altanerId',
          element: <ProjectPage />,
        },
        { path: ':altanerId/c/:componentId', element: <ProjectPage /> },
        { path: ':altanerId/c/:componentId/i/:itemId', element: <ProjectPage /> },
        {
          path: ':altanerId/c/:componentId/b/:baseId/tables/:tableId',
          element: <ProjectPage />,
        },
        {
          path: ':altanerId/c/:componentId/b/:baseId/tables/:tableId/views/:viewId',
          element: <ProjectPage />,
        },
        {
          path: ':altanerId/c/:componentId/b/:baseId/tables/:tableId/views/:viewId/records/:recordId',
          element: <ProjectPage />,
        },
      ],
    },
    {
      path: 'remix',
      ErrorBoundary: RootBoundary,
      children: [
        {
          path: ':altanerId',
          element: (
            <AuthGuard requireAuth={true}>
              <RemixPage />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: 'database',
      ErrorBoundary: RootBoundary,
      children: [
        {
          element: (
            <AuthGuard requireAuth={true}>
              <StandaloneBasePage />
            </AuthGuard>
          ),
          index: true,
        },
        {
          path: ':baseId',
          element: (
            <AuthGuard requireAuth={true}>
              <StandaloneBasePage />
            </AuthGuard>
          ),
        },
        {
          path: ':baseId/tables/:tableId/views/:viewId',
          element: (
            <AuthGuard requireAuth={true}>
              <StandaloneBasePage />
            </AuthGuard>
          ),
        },
        {
          path: ':baseId/tables/:tableId/views/:viewId/records/:recordId',
          element: (
            <AuthGuard requireAuth={true}>
              <StandaloneBasePage />
            </AuthGuard>
          ),
        },
      ],
    },
    {
      path: 'workflow',
      ErrorBoundary: RootBoundary,
      children: [
        {
          path: ':id',
          element: (
            <AuthGuard requireAuth={false}>
              <StandaloneWorkflowPage />
            </AuthGuard>
          ),
        },
      ],
    },

    {
      path: 'accounts',
      element: (
        <AuthGuard requireAuth={false}>
          <DashboardLayout />
        </AuthGuard>
      ),
      children: [
        {
          index: true,
          element: <AccountsPage />,
        },
        {
          path: ':accountId',
          element: <AccountPage />,
        },
      ],
    },
    // Main Routes
    {
      element: (
        <AuthGuard requireAuth={false}>
          <DashboardLayout />
        </AuthGuard>
      ),
      ErrorBoundary: RootBoundary,
      children: [
        {
          index: true,
          element: <DashboardPage />,
        },
        {
          path: ':mode',
          element: <DashboardPage />,
        },
        { path: 'me', element: <UserProfilePage /> },
        { path: 'referrals', element: <ReferralsPage /> },
        { path: 'permission-denied', element: <PermissionDeniedPage /> },
        { path: 'admin', element: <AdminPage /> },
        { path: 'integration', element: <IntegrationPage /> },
        { path: 'media', element: <MediaPage /> },
        { path: 'terms', element: <Terms /> },
        { path: 'privacy', element: <Privacy /> },
        {
          path: 'pricing',
          element: <PricingPage />,
        },
        {
          path: 'flow',
          children: [{ path: ':id', element: <StandaloneWorkflowPage /> }],
        },
        {
          path: 'template/:templateId',
          element: <TemplatePage />,
        },
        {
          path: 'marketplace',
          children: [{ element: <MarketplacePage />, index: true }],
        },
        {
          path: 'usage',
          children: [
            { element: <UsagePage />, index: true },
            { path: 'tasks', element: <ExecutionsPage /> },
          ],
        },
        {
          path: 'bases',
          children: [
            { element: <BasesPage />, index: true },
            { path: ':baseId', element: <BasePage /> },
            { path: ':baseId/tables/:tableId/views/:viewId', element: <BasePage /> },
            {
              path: ':baseId/tables/:tableId/views/:viewId/records/:recordId',
              element: <BasePage />,
            },
          ],
        },
        {
          path: 'members',
          children: [
            { element: <AccountMembers />, index: true },
            { path: ':memberId', element: <MemberPage /> },
          ],
        },
        {
          path: 'agent',
          children: [
            { element: <AgentsPage />, index: true },
            { path: ':agentId', element: <AgentPage /> },
          ],
        },
        {
          path: 'interfaces',
          children: [
            { element: <InterfacesPage />, index: true },
            { path: ':interfaceId', element: <InterfacePage /> },
          ],
        },
        {
          path: 'account',
          children: [
            {
              element: (
                <Navigate
                  to="/platform/account/settings"
                  replace
                />
              ),
              index: true,
            },
            { path: 'settings', element: <UserAccountPage /> },
            { path: 'api', element: <APIKeys /> },
          ],
        },
      ],
    },
    {
      element: <CompactLayout />,
      children: [
        { path: 'coming-soon', element: <ComingSoonPage /> },
        { path: 'maintenance', element: <MaintenancePage /> },
        { path: '500', element: <Page500 /> },
        { path: '404', element: <Page404 /> },
        { path: '403', element: <Page403 /> },
      ],
    },
    {
      path: 'es/*',
      element: (
        <Navigate
          to="/"
          replace
        />
      ),
    },
    {
      path: 'en',
      element: (
        <Navigate
          to="/"
          replace
        />
      ),
    },
    {
      path: 'us',
      element: (
        <Navigate
          to="/"
          replace
        />
      ),
    },
    {
      path: 'pt',
      element: (
        <Navigate
          to="/"
          replace
        />
      ),
    },
    {
      path: 'de',
      element: (
        <Navigate
          to="/"
          replace
        />
      ),
    },
    {
      path: 'fr',
      element: (
        <Navigate
          to="/"
          replace
        />
      ),
    },
    {
      path: '*',
      element: (
        <Navigate
          to="/404"
          replace
        />
      ),
    },
  ]);

  // For mobile, we'll use the standard React Router for now
  // In a full mobile optimization, you might want to implement IonReactRouter
  return <RouterProvider router={router} />;
};

export default memo(Router);
