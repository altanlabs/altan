import { Suspense, lazy } from 'react';

import AltanLogo from '../components/loaders/AltanLogo.jsx';

// ----------------------------------------------------------------------

const AltanLogoFixed = (
  <AltanLogo
    wrapped
    fixed
    showProgress
  />
);

// eslint-disable-next-line react/display-name
const Loadable = (Component) => (props) => (
  <Suspense fallback={AltanLogoFixed}>
    <Component {...props} />
  </Suspense>
);

// ----------------------------------------------------------------------

// AUTH
export const LoginPage = Loadable(lazy(() => import('../pages/auth/LoginPage.jsx')));
export const RegisterPage = Loadable(lazy(() => import('../pages/auth/RegisterPage.jsx')));
export const VerifyCodePage = Loadable(lazy(() => import('../pages/auth/VerifyCodePage.jsx')));
export const NewPasswordPage = Loadable(lazy(() => import('../pages/auth/NewPasswordPage.jsx')));
export const ResetPasswordPage = Loadable(
  lazy(() => import('../pages/auth/ResetPasswordPage.jsx')),
);

export const RoomPage = Loadable(lazy(() => import('../pages/RoomPage.jsx')));

// DASHBOARD: GENERAL
// export const GeneralAppPage = Loadable(lazy(() => import('../pages/dashboard/GeneralAppPage')));
export const DashboardPage = Loadable(lazy(() => import('../pages/dashboard/DashboardPage.jsx')));
export const UsagePage = Loadable(lazy(() => import('../pages/dashboard/UsagePage.jsx')));
export const ExecutionsPage = Loadable(lazy(() => import('../pages/dashboard/ExecutionsPage.jsx')));
export const Onboarding = Loadable(lazy(() => import('../pages/dashboard/Onboarding.jsx')));

export const UserProfilePage = Loadable(
  lazy(() => import('../pages/dashboard/UserProfilePage.jsx')),
);

export const UserAccountPage = Loadable(
  lazy(() => import('../pages/dashboard/UserAccountPage.jsx')),
);
export const AccountMembers = Loadable(lazy(() => import('../pages/dashboard/AccountMembers.jsx')));
export const APIKeys = Loadable(lazy(() => import('../pages/dashboard/APIKeys.jsx')));
export const ReferralsPage = Loadable(lazy(() => import('../pages/dashboard/ReferralsPage.jsx')));

export const ProjectPage = Loadable(lazy(() => import('../pages/dashboard/ProjectPage.jsx')));

export const NewAltanerPage = Loadable(
  lazy(() => import('../pages/dashboard/altaners/NewAltanerPage.jsx')),
);

export const FlowsPage = Loadable(lazy(() => import('../pages/dashboard/flows/FlowsPage.jsx')));

export const BasePage = Loadable(lazy(() => import('../pages/dashboard/databases/BasePage.jsx')));
export const BasesPage = Loadable(lazy(() => import('../pages/dashboard/databases/BasesPage.jsx')));

export const InterfacePage = Loadable(
  lazy(() => import('../pages/dashboard/interfaces/InterfacePage.jsx')),
);
export const InterfacesPage = Loadable(
  lazy(() => import('../pages/dashboard/interfaces/InterfacesPage.jsx')),
);

// export const ViewPage = Loadable(lazy(() => import('../pages/dashboard/databases/ViewPage.jsx')));

export const MediaPage = Loadable(
  lazy(() => import('../pages/dashboard/assets/modules/MediaPage.jsx')),
);

export const GatesPage = Loadable(lazy(() => import('../pages/dashboard/GatesPage.jsx')));

export const MarketplacePage = Loadable(
  lazy(() => import('../pages/dashboard/marketplace/MarketplacePage.jsx')),
);

export const TemplatePage = Loadable(
  lazy(() => import('../pages/dashboard/marketplace/TemplatePage.jsx')),
);

export const CloneTemplatePage = Loadable(
  lazy(() => import('../pages/CloneTemplatePage.jsx')),
);

export const AgentsPage = Loadable(lazy(() => import('../pages/dashboard/AgentsPage.jsx')));

export const AgentPage = Loadable(lazy(() => import('../pages/dashboard/AgentPage.jsx')));
export const AgentSharePage = Loadable(lazy(() => import('../pages/dashboard/AgentSharePage.jsx')));
export const AgentCardPage = Loadable(lazy(() => import('../pages/dashboard/AgentCardPage.jsx')));

export const AdminPage = Loadable(lazy(() => import('../pages/dashboard/AdminPage.jsx')));
export const IntegrationPage = Loadable(
  lazy(() => import('../pages/dashboard/IntegrationPage.jsx')),
);
export const RemixPage = Loadable(lazy(() => import('../pages/dashboard/RemixPage.jsx')));
// export const CatalogsPage = Loadable(lazy(() => import('../pages/dashboard/CatalogsPage')));
export const MemberPage = Loadable(lazy(() => import('../pages/dashboard/MemberPage.jsx')));

// TEST RENDER PAGE BY ROLE
export const PermissionDeniedPage = Loadable(
  lazy(() => import('../pages/dashboard/PermissionDeniedPage.jsx')),
);

export const IntegrationCreator = Loadable(
  lazy(() => import('../pages/dashboard/superadmin/IntegrationCreator.jsx')),
);

// SUPERADMIN
export const SuperAdminMain = Loadable(
  lazy(() => import('../pages/dashboard/superadmin/SuperAdminMain.jsx')),
);
export const InternalUtils = Loadable(
  lazy(() => import('../pages/dashboard/superadmin/InternalUtils.jsx')),
);
export const ExternalUtils = Loadable(
  lazy(() => import('../pages/dashboard/superadmin/ExternalUtils.jsx')),
);

// MAIN
export const Page500 = Loadable(lazy(() => import('../pages/Page500.jsx')));
export const Page403 = Loadable(lazy(() => import('../pages/Page403.jsx')));
export const Page404 = Loadable(lazy(() => import('../pages/Page404.jsx')));

export const Terms = Loadable(lazy(() => import('../pages/Terms.jsx')));
export const Privacy = Loadable(lazy(() => import('../pages/Privacy.jsx')));

export const PricingPage = Loadable(lazy(() => import('../pages/PricingPage.jsx')));
export const ComingSoonPage = Loadable(lazy(() => import('../pages/ComingSoonPage.jsx')));
export const MaintenancePage = Loadable(lazy(() => import('../pages/MaintenancePage.jsx')));

export const StandaloneWorkflowPage = Loadable(
  lazy(() => import('../sections/@dashboard/flows/Workflow.jsx')),
);
export const StandaloneBasePage = Loadable(
  lazy(() => import('../pages/dashboard/databases/StandaloneBasePage.jsx')),
);

export const OverallActivityPage = Loadable(
  lazy(() => import('../pages/dashboard/OverallActivityPage.jsx')),
);

export const AccountPage = Loadable(
  lazy(() => import('../pages/dashboard/marketplace/AccountPage.jsx')),
);

export const AccountsPage = Loadable(
  lazy(() => import('../pages/dashboard/marketplace/AccountsPage.jsx')),
);
