import { memo } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';

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
  return (
    <BrowserRouter>
      <Switch>
        {/* Auth Routes */}
        <Route path="/auth/login" exact>
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        </Route>
        
        <Route path="/auth/register" exact>
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        </Route>
        
        <Route path="/auth/reset-password" exact>
          <CompactLayout>
            <ResetPasswordPage />
          </CompactLayout>
        </Route>
        
        <Route path="/auth/new-password" exact>
          <CompactLayout>
            <NewPasswordPage />
          </CompactLayout>
        </Route>
        
        <Route path="/auth/verify" exact>
          <CompactLayout>
            <VerifyCodePage />
          </CompactLayout>
        </Route>

        {/* Room Route */}
        <Route path="/room/:roomId" exact>
          <AuthGuard requireAuth={true}>
            <RoomPage />
          </AuthGuard>
        </Route>

        {/* Public Agent Routes */}
        <Route path="/agents/:agentId/share" exact>
          <AgentSharePage />
        </Route>
        
        <Route path="/agent/:agentId/card" exact>
          <AgentCardPage />
        </Route>

        {/* SuperAdmin Routes */}
        <Route path="/xsup" exact>
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <SuperAdminMain />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/xsup/internal" exact>
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <InternalUtils />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/xsup/external" exact>
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <ExternalUtils />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/xsup/creator" exact>
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <IntegrationCreator />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/xsup/activity" exact>
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <OverallActivityPage />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>

        {/* Project Routes */}
        <Route path="/project/:altanerId" exact>
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/project/:altanerId/c/:componentId" exact>
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/project/:altanerId/c/:componentId/i/:itemId" exact>
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        {/* Database Routes */}
        <Route path="/database" exact>
          <AuthGuard requireAuth={true}>
            <StandaloneBasePage />
          </AuthGuard>
        </Route>
        
        <Route path="/database/:baseId" exact>
          <AuthGuard requireAuth={true}>
            <StandaloneBasePage />
          </AuthGuard>
        </Route>

        {/* Workflow Route */}
        <Route path="/workflow/:id" exact>
          <AuthGuard requireAuth={false}>
            <StandaloneWorkflowPage />
          </AuthGuard>
        </Route>

        {/* Accounts Routes */}
        <Route path="/accounts" exact>
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AccountsPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/accounts/:accountId" exact>
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AccountPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Main Dashboard Routes */}
        <Route path="/" exact>
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/:mode" exact>
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/me" exact>
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <UserProfilePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>
        
        <Route path="/pricing" exact>
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <PricingPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Error Pages */}
        <Route path="/coming-soon" exact>
          <CompactLayout>
            <ComingSoonPage />
          </CompactLayout>
        </Route>
        
        <Route path="/500" exact>
          <CompactLayout>
            <Page500 />
          </CompactLayout>
        </Route>
        
        <Route path="/404" exact>
          <CompactLayout>
            <Page404 />
          </CompactLayout>
        </Route>

        {/* Redirects */}
        <Route path="/es" render={() => <Redirect to="/" />} />
        <Route path="/en" render={() => <Redirect to="/" />} />
        <Route path="/us" render={() => <Redirect to="/" />} />
        <Route path="/pt" render={() => <Redirect to="/" />} />
        <Route path="/de" render={() => <Redirect to="/" />} />
        <Route path="/fr" render={() => <Redirect to="/" />} />
        
        {/* Catch all - redirect to 404 */}
        <Route render={() => <Redirect to="/404" />} />
      </Switch>
    </BrowserRouter>
  );
};

export default memo(Router);
