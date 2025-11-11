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
  CloudPage,
  ProjectPage,
  ProjectPageMobileTest,
  BasesPage,
  ExecutionsPage,
  DashboardPage,
  NewDashboardPage,
  UsagePage,
  UsageDatabasePage,
  TestNotificationsPage,
  IntegrationCreator,
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
  SDKTestPage,
  SDKCookbookPage,
  SupportPage,
  VirtualDesktopPage,
  V2LandingPage,
  V2RoomsPage,
  V2RoomPage,
} from './elements.jsx';
import AuthGuard from '../auth/AuthGuard.jsx';
import GuestGuard from '../auth/GuestGuard.jsx';
import PageTracker from '../components/analytics/PageTracker.jsx';
import ScrollToTop from '../components/scroll-to-top/ScrollToTop.js';
import TrackingParamsCapture from '../components/tracking/TrackingParamsCapture.jsx';
import CompactLayout from '../layouts/compact';
import DashboardLayout from '../layouts/dashboard';
import NewLayout from '../layouts/dashboard/new/NewLayout.jsx';
import ProjectLayout from '../layouts/dashboard/ProjectLayout.jsx';
import SuperAdminLayout from '../layouts/superadmin/SuperAdminLayout.jsx';
import DashboardDataProvider from '../providers/DashboardDataProvider.jsx';

// ----------------------------------------------------------------------

const Router = () => {
  return (
    <BrowserRouter>
      <ScrollToTop />
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
            <DashboardDataProvider>
              <NewLayout>
                <RoomPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Chat Route */}
        <Route
          path="/chat"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <ChatPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Agent Share Route - handles auth internally */}
        <Route
          path="/agent/:agentId/share"
          exact
        >
          <AuthGuard requireAuth={false}>
            <AgentSharePage />
          </AuthGuard>
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
        {/* Operate mode route - must come before generic project routes */}
        <Route
          path="/project/:altanerId/operate"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        {/* Plans routes - must come before generic project routes */}
        <Route
          path="/project/:altanerId/plans/:planId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/plans"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

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

        {/* Cloud routes - section-based structure */}
        <Route
          path="/project/:altanerId/c/:componentId/cloud/:cloudId/tables/:tableId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/cloud/:cloudId/tables/:tableId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/cloud/:cloudId/:section"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/project/:altanerId/c/:componentId/cloud/:cloudId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <ProjectLayout>
              <ProjectPage />
            </ProjectLayout>
          </AuthGuard>
        </Route>

        {/* Legacy base routes - kept for backwards compatibility */}
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
            <DashboardDataProvider>
              <NewLayout>
                <FlowPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Accounts Routes */}
        <Route
          path="/accounts"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <AccountsPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/accounts/:accountId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <AccountPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Bases Routes */}
        <Route
          path="/bases"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <BasesPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Cloud Routes - New routing structure */}
        <Route
          path="/cloud/:cloudId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <CloudPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/cloud/:cloudId/tables/:tableId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <CloudPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/cloud/:cloudId/tables/:tableId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <CloudPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Legacy Base Routes - Redirect to Cloud */}
        <Route
          path="/bases/:baseId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <BasePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId/views/:viewId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <BasePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId/views/:viewId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <BasePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <BasePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/bases/:baseId/tables/:tableId/records/:recordId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <BasePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Members Routes */}
        <Route
          path="/members"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <AccountMembers />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Agent Routes */}
        <Route
          path="/agent"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <AgentsPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/agent/:agentId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <AgentPage />
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Rooms Routes */}
        <Route
          path="/rooms/:roomId"
          exact
        >
          <AuthGuard requireAuth={true}>
            <DashboardDataProvider>
              <NewLayout>
                <RoomsPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/rooms"
          exact
        >
          <AuthGuard requireAuth={true}>
            <DashboardDataProvider>
              <NewLayout>
                <RoomsPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Interfaces Routes */}
        <Route
          path="/interfaces"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <InterfacesPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/interfaces/:interfaceId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <InterfacePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Account Settings Routes */}
        <Route
          path="/account"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <Redirect to="/account/settings" />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/account/settings"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <UserAccountPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/account/api"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <APIKeys />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Usage Routes */}
        <Route
          path="/usage"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <UsagePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/usage/tasks"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <ExecutionsPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/usage/databases"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <UsageDatabasePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Test Notifications Route */}
        <Route
          path="/test-notifications"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <TestNotificationsPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Marketplace Routes */}
        <Route
          path="/marketplace"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <MarketplacePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/template/:templateId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <TemplatePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/clone/:templateId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <CloneTemplatePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Other Dashboard Routes */}
        <Route
          path="/me"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <UserProfilePage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/referrals"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <ReferralsPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/permission-denied"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <PermissionDeniedPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/admin"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <AdminPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/integration"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <IntegrationPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/media"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <MediaPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Testing Routes */}
        <Route
          path="/testing/text-voice-demo"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout></NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/testing/sdk"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <SDKTestPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/sdk/cookbook"
          exact
        >
          <AuthGuard requireAuth={false}>
            <SDKCookbookPage />
          </AuthGuard>
        </Route>

        <Route
          path="/terms"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <Terms />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/privacy"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <Privacy />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/contact"
          exact
        >
          <DashboardDataProvider>
            <NewLayout>
              <ContactPage />
            </NewLayout>
          </DashboardDataProvider>
        </Route>

        <Route
          path="/support"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <SupportPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/pricing"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewLayout>
                <PricingPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        <Route
          path="/purchase/success"
          exact
        >
          <AuthGuard requireAuth={true}>
            <DashboardDataProvider>
              <NewLayout>
                <PurchaseSuccessPage />
              </NewLayout>
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Demo Routes */}
        <Route
          path="/demo/landing"
          exact
        >
          <AuthGuard requireAuth={false}>
            <V2LandingPage />
          </AuthGuard>
        </Route>

        <Route
          path="/demo"
          exact
        >
          <AuthGuard requireAuth={false}>
            <VirtualDesktopPage />
          </AuthGuard>
        </Route>

        {/* V2 Virtual Desktop (Legacy - redirect to demo) */}
        <Route
          path="/v2/landing"
          exact
        >
          <AuthGuard requireAuth={false}>
            <V2LandingPage />
          </AuthGuard>
        </Route>

        <Route
          path="/v2/rooms/:roomId"
          exact
        >
          <AuthGuard requireAuth={false}>
            <V2RoomPage />
          </AuthGuard>
        </Route>

        <Route
          path="/v2/rooms"
          exact
        >
          <AuthGuard requireAuth={false}>
            <V2RoomsPage />
          </AuthGuard>
        </Route>

        <Route
          path="/v2"
          exact
        >
          <AuthGuard requireAuth={false}>
            <VirtualDesktopPage />
          </AuthGuard>
        </Route>

        {/* Main Dashboard Routes */}

        <Route
          path="/"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardDataProvider>
              <NewDashboardPage />
            </DashboardDataProvider>
          </AuthGuard>
        </Route>

        {/* Legacy Dashboard - Deprecated */}
        <Route
          path="/legacy"
          exact
        >
          <AuthGuard requireAuth={false}>
            <DashboardLayout>
              <DashboardPage />
            </DashboardLayout>
          </AuthGuard>
        </Route>

        <Route
          path="/legacy/:mode"
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
