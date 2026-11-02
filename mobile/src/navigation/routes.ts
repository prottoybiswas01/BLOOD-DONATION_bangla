export type MainTabKey = 'Home' | 'Donors' | 'Requests' | 'Institutions' | 'Profile';

export type RootStackParamList = {
  MainTabs: { initialTab?: MainTabKey } | undefined;
  CreateRequest: undefined;
  Login: undefined;
  Register: undefined;
  PasswordRecovery: undefined;
  AdminDashboard: undefined;
  ModeratorDashboard: undefined;
};

export const AppRoutes = {
  // Main Tab Routes
  HOME: 'Home' as const,
  DONORS: 'Donors' as const,
  REQUESTS: 'Requests' as const,
  INSTITUTIONS: 'Institutions' as const,
  PROFILE: 'Profile' as const,

  // Stack Screen Routes
  MAIN_TABS: 'MainTabs' as const,
  CREATE_REQUEST: 'CreateRequest' as const,
  LOGIN: 'Login' as const,
  REGISTER: 'Register' as const,
  PASSWORD_RECOVERY: 'PasswordRecovery' as const,
  ADMIN_DASHBOARD: 'AdminDashboard' as const,
  MODERATOR_DASHBOARD: 'ModeratorDashboard' as const,
};

export type TargetRoute = 
  | { type: 'tab'; tab: MainTabKey }
  | { type: 'stack'; screen: keyof RootStackParamList };

/**
 * Resolves any route identifier (canonical, legacy, lowercase, snake_case)
 * to its typed canonical target so navigation never fails or gets dropped.
 */
export function resolveNavigationTarget(target: string): TargetRoute {
  const normalized = (target || '').toLowerCase().trim().replace(/[-_]/g, '');

  switch (normalized) {
    case 'home':
      return { type: 'tab', tab: 'Home' };

    case 'donors':
    case 'donor':
    case 'donorsearch':
    case 'searchdonors':
      return { type: 'tab', tab: 'Donors' };

    case 'requests':
    case 'request':
    case 'bloodrequests':
    case 'bloodrequest':
      return { type: 'tab', tab: 'Requests' };

    case 'institutions':
    case 'institution':
    case 'campuses':
    case 'campus':
      return { type: 'tab', tab: 'Institutions' };

    case 'profile':
    case 'myprofile':
    case 'account':
      return { type: 'tab', tab: 'Profile' };

    case 'createrequest':
    case 'newrequest':
    case 'makerequest':
      return { type: 'stack', screen: 'CreateRequest' };

    case 'login':
    case 'signin':
      return { type: 'stack', screen: 'Login' };

    case 'register':
    case 'signup':
      return { type: 'stack', screen: 'Register' };

    case 'passwordrecovery':
    case 'recovery':
    case 'forgotpassword':
      return { type: 'stack', screen: 'PasswordRecovery' };

    case 'admindashboard':
    case 'admin':
      return { type: 'stack', screen: 'AdminDashboard' };

    case 'moderatordashboard':
    case 'moderator':
      return { type: 'stack', screen: 'ModeratorDashboard' };

    default:
      // Fallback: If starts with create, navigate to CreateRequest; otherwise default to Home tab
      if (normalized.includes('create')) {
        return { type: 'stack', screen: 'CreateRequest' };
      }
      return { type: 'tab', tab: 'Home' };
  }
}

