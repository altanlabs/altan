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
  ProjectPageMobileTest,
  BasesPage,
  ExecutionsPage,
  DashboardPage,
  UsagePage,
  UsageDatabasePage,
  IntegrationCreator,
  MemberPage,
  MediaPage,
  UserProfilePage,
  UserAccountPage,
  AdminPage,
  MarketplacePage,
  TemplatePage,
  CloneTemplatePage,
  PermissionDeniedPage,
  IntegrationPage,
  FlowPage,
  StandaloneRoomPage,
  //
  Page500,
  Page403,
  Page404,
  PricingPage,
  PurchaseSuccessPage,
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
  RoomsPage,
  ChatPage,
  Terms,
  Privacy,
  ContactPage,
  DemoTextVoicePage,
  SDKTestPage,
  SupportPage,
} from './elements.jsx';
import AuthGuard from '../auth/AuthGuard.jsx';
import GuestGuard from '../auth/GuestGuard.jsx';
import PageTracker from '../components/analytics/PageTracker.jsx';
import TrackingParamsCapture from '../components/tracking/TrackingParamsCapture.jsx';
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
import ProjectLayout from '../layouts/dashboard/ProjectLayout.jsx';
import SuperAdminLayout from '../layouts/superadmin/SuperAdminLayout.jsx';

// ----------------------------------------------------------------------

const Router = () => {
  return (
    <BrowserRouter>
      <PageTracker />
      <TrackingParamsCapture />
      <Switch>
        {/* Auth Routes */}
        <Route
          path="/auth/login"
          exact
        >
          <GuestGuard>
            <LoginPage />
          </GuestGuard>
        </Route>

        <Route
          path="/auth/register"
          exact
        >
          <GuestGuard>
            <RegisterPage />
          </GuestGuard>
        </Route>

        <Route
          path="/auth/reset-password"
          exact
        >
          <CompactLayout>
            <ResetPasswordPage />
          </CompactLayout>
        </Route>

        <Route
          path="/auth/new-password"
          exact
        >
          <CompactLayout>
            <NewPasswordPage />
          </CompactLayout>
        </Route>

        <Route
          path="/auth/verify"
          exact
        >
          <CompactLayout>
            <VerifyCodePage />
          </CompactLayout>
        </Route>

        <Route
          path="/r/:roomId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <StandaloneRoomPage />
          </AuthGuard>
        </Route>

        {/* Room Route */}
        <Route
          path="/room/:roomId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <RoomPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Chat Route */}
        <Route
          path="/chat"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <ChatPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Public Agent Routes */}
        <Route
          path="/agent/:agentId/share"
          exact
        >
          <AgentSharePage />
        </Route>

        <Route
          path="/agent/:agentId/card"
          exact
        >
          <AgentCardPage />
        </Route>

        {/* SuperAdmin Routes */}
        <Route
          path="/xsup"
          exact
        >
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <SuperAdminMain />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/xsup/internal"
          exact
        >
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <InternalUtils />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/xsup/external"
          exact
        >
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <ExternalUtils />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/xsup/creator"
          exact
        >
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <IntegrationCreator />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/xsup/activity"
          exact
        >
          <AuthGuard requireAuth={true}>
            <SuperAdminLayout>
              <OverallActivityPage />
            </SuperAdminLayout>
          </AuthGuard>
        </Route>

        {/* Project Routes */}
        <Route
          path="/project/:altanerId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/i/:itemId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/b/:baseId/tables/:tableId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/b/:baseId/tables/:tableId/views/:viewId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/b/:baseId/tables/:tableId/views/:viewId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/b/:baseId/tables/:tableId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        {/* Simplified Project Component Routes */}
        <Route
          path="/project/:altanerId/database"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/interface"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/flows"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/flows/:flowId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/agents"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/agents/:agentId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        {/* Mobile Test Routes */}
        <Route
          path="/mobile-test/:altanerId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPageMobileTest />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/mobile-test/:altanerId/c/:componentId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPageMobileTest />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/mobile-test/:altanerId/c/:componentId/i/:itemId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPageMobileTest />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        {/* Remix Routes */}
        <Route
          path="/remix/:altanerId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <RemixPage />
          </AuthGuard>
        </Route>

        {/* Database Routes */}
        <Route
          path="/database"
          exact
        >
          <AuthGuard requireAuth={true}>
            <StandaloneBasePage />
          </AuthGuard>
        </Route>

        <Route
          path="/database/:baseId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <StandaloneBasePage />
          </AuthGuard>
        </Route>

        <Route
          path="/database/:baseId/tables/:tableId/views/:viewId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <StandaloneBasePage />
          </AuthGuard>
        </Route>

        <Route
          path="/database/:baseId/tables/:tableId/views/:viewId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <StandaloneBasePage />
          </AuthGuard>
        </Route>

        <Route
          path="/database/:baseId/tables/:tableId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <StandaloneBasePage />
          </AuthGuard>
        </Route>

        {/* Workflow Routes */}
        <Route
          path="/workflow/:id"
          exact
        >
          <AuthGuard requireAuth={false}>
            <FlowPage />
          </AuthGuard>
        </Route>

        <Route
          path="/flow/:id"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <FlowPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Accounts Routes */}
        <Route
          path="/accounts"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AccountsPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/accounts/:accountId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AccountPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Bases Routes */}
        <Route
          path="/bases"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <BasesPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <BasePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId/views/:viewId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <BasePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId/views/:viewId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <BasePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <BasePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <BasePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Members Routes */}
        <Route
          path="/members"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AccountMembers />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/members/:memberId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <MemberPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Agent Routes */}
        <Route
          path="/agent"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AgentsPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/agent/:agentId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AgentPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Rooms Routes */}
        <Route
          path="/rooms/:roomId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <DashboardLayout>
              <RoomsPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/rooms"
          exact
        >
          <AuthGuard requireAuth={true}>
            <DashboardLayout>
              <RoomsPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Interfaces Routes */}
        <Route
          path="/interfaces"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <InterfacesPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/interfaces/:interfaceId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <InterfacePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Account Settings Routes */}
        <Route
          path="/account"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <Redirect to="/account/settings" />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/account/settings"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <UserAccountPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/account/api"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <APIKeys />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Usage Routes */}
        <Route
          path="/usage"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <UsagePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/usage/tasks"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <ExecutionsPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/usage/databases"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <UsageDatabasePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Marketplace Routes */}
        <Route
          path="/marketplace"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <MarketplacePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/template/:templateId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <TemplatePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/clone/:templateId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <CloneTemplatePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Other Dashboard Routes */}
        <Route
          path="/me"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <UserProfilePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/referrals"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <ReferralsPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/permission-denied"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <PermissionDeniedPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/admin"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <AdminPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/integration"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <IntegrationPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/media"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <MediaPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Testing Routes */}
        <Route
          path="/testing/text-voice-demo"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <DemoTextVoicePage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/testing/sdk"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <SDKTestPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/terms"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <Terms />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/privacy"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <Privacy />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/contact"
          exact
        >
          <DashboardLayout>
            <ContactPage />
          </DashboardLayout>
        </Route>

        <Route
          path="/support"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <SupportPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/pricing"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <PricingPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/purchase/success"
          exact
        >
          <AuthGuard requireAuth={true}>
            <DashboardLayout>
              <PurchaseSuccessPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Main Dashboard Routes */}
        <Route
          path="/"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/:mode"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        {/* Error Pages */}
        <Route
          path="/coming-soon"
          exact
        >
          <CompactLayout>
            <ComingSoonPage />
          </CompactLayout>
        </Route>

        <Route
          path="/maintenance"
          exact
        >
          <CompactLayout>
            <MaintenancePage />
          </CompactLayout>
        </Route>

        <Route
          path="/500"
          exact
        >
          <CompactLayout>
            <Page500 />
          </CompactLayout>
        </Route>

        <Route
          path="/404"
          exact
        >
          <CompactLayout>
            <Page404 />
          </CompactLayout>
        </Route>

        <Route
          path="/403"
          exact
        >
          <CompactLayout>
            <Page403 />
          </CompactLayout>
        </Route>

        {/* Redirects */}
        <Route
          path="/es"
          render={() => <Redirect to="/" />}
        />
        <Route
          path="/en"
          render={() => <Redirect to="/" />}
        />
        <Route
          path="/us"
          render={() => <Redirect to="/" />}
        />
        <Route
          path="/pt"
          render={() => <Redirect to="/" />}
        />
        <Route
          path="/de"
          render={() => <Redirect to="/" />}
        />
        <Route
          path="/fr"
          render={() => <Redirect to="/" />}
        />

        {/* Catch all - redirect to 404 */}
        <Route render={() => <Redirect to="/404" />} />
      </Switch>
    </BrowserRouter>
  );
};

export default memo(Router);
