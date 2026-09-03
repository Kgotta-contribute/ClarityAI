
import React, { useState, useEffect } from 'react';

import { BrowserRouter as Router, Route, Switch } from 'react-router-dom';

// Okta disabled for independent dev mode
// import { OktaAuth } from '@okta/okta-auth-js';
// import { Security, LoginCallback } from '@okta/okta-react';
// const oktaAuth = new OktaAuth(oktaConfig);

import Sidebar from './components/Sidebar';

import GroupSelectionPage from './pages/GroupSelectionPage';

import { ThemeProvider } from './contexts/ThemeContext';

import HomePage from './pages/HomePage';

import authService from "./services/authService";

import MainContent from './components/MainContent';

import AudioFilesPage from './pages/AudioFilesPage';

import InteractionsFilters from './components/InteractionsFilters';

import TranscriptsPage from './pages/TranscriptsPage';

import ChatHistoryPage from './pages/ChatHistoryPage';

import AuthProvider from './SSO/AuthProvider';

import oktaConfig from './SSO/oktaConfig';

import { fetchInterceptor } from './SSO/FetchInterceptors';

import { clearAuthData } from './utils/tokenManager';

import ToastContainer from './components/Toast/ToastContainer';

 

// Okta instance bypassed for independent running

 

interface FilterState {

  convoDateValue: string;

  convoStartDateValue: string;

  convoEndDateValue: string;

  isResetDisable: boolean;

}

 

interface User {

  id: string;

  name: string;

  email: string;

  department: string;

  role: string;

}

 

const ClarityAIApp: React.FC = () => {

  const [currentUser, setCurrentUser] = useState<User | null>({
    id: 'V123456',
    name: 'Clarity Business User',
    email: 'clarity.user@EH.com',
    department: 'Healthcare Operations',
    role: 'Business User'
  });
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(true);
  const [showGroupSelection, setShowGroupSelection] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [activeTab, setActiveTab] = useState<string>('home');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);

  const [audioFilesFilters, setAudioFilesFilters] = useState<FilterState | undefined>(undefined);

 

  const [uploadState, setUploadState] = useState({

    selectedFiles: [] as File[],

    fileStatuses: {} as { [fileName: string]: unknown },

    currentJobId: null as string | null,

    uploadStatus: 'idle' as 'idle' | 'uploading' | 'success' | 'error',

    streamStatus: 'idle' as 'idle' | 'streaming' | 'completed' | 'error'

  });

 

  useEffect(() => {

    const checkAuth = (): void => {

      let oktaUserInfo = sessionStorage.getItem('okta_user_info');

      if (!oktaUserInfo) {
        const defaultMockUser = {
          displayName: 'Clarity Business User',
          domainID: 'V123456',
          email: 'clarity.user@EH.com',
          groups: ['Clarity_AI_Users'],
          token: 'mock-dev-token',
          tokenExpiry: Date.now() / 1000 + 86400,
        };
        sessionStorage.setItem('okta_user_info', JSON.stringify(defaultMockUser));
        oktaUserInfo = JSON.stringify(defaultMockUser);
      }

      try {
        const ssoUser = JSON.parse(oktaUserInfo);

        const user: User = {
          id: ssoUser.domainID || 'V123456',
          name: ssoUser.displayName || 'Clarity Business User',
          email: ssoUser.email || 'clarity.user@EH.com',
          department: 'SSO Authenticated',
          role: 'Business User'
        };

        setCurrentUser(user);
        setIsAuthenticated(true);

        localStorage.setItem('clarity_user', JSON.stringify(user));
        localStorage.setItem('clarity_authenticated', 'true');

        const userGroups = ssoUser.groups || ['Clarity_AI_Users'];
        const selectedGroup = localStorage.getItem('clarity_selected_group');

        if (userGroups.length > 1 && !selectedGroup) {
          setShowGroupSelection(true);
        } else if (!selectedGroup && userGroups.length > 0) {
          localStorage.setItem('clarity_selected_group', userGroups[0]);
        }

        setIsLoading(false);
      } catch (error) {
        console.error('Error parsing SSO user info:', error);
        setIsLoading(false);
      }
    };

    checkAuth();

 

    const handleStorageChange = () => {

      checkAuth();

    };

 

    window.addEventListener('storage', handleStorageChange);

 

    return () => {

      window.removeEventListener('storage', handleStorageChange);

    };

  }, [isAuthenticated]);

 

  useEffect(() => {

    const handleTokenExpired = () => {

      console.error('Token expiration event received - logging out');

      clearAuthData();

      setCurrentUser(null);

      setIsAuthenticated(false);

      setShowGroupSelection(false);

 

      window.location.href = '/';

    };

 

    window.addEventListener('token-expired', handleTokenExpired);

 

    return () => {

      window.removeEventListener('token-expired', handleTokenExpired);

    };

  }, []);

 

  const handleGroupSelected = (): void => {

    setShowGroupSelection(false);

  };

 

  const handleLogout = (): void => {

    authService.logout();

    clearAuthData();

    setCurrentUser(null);

    setIsAuthenticated(false);

    setShowGroupSelection(false);

 

    // oktaAuth.signOut() bypassed for local running

 

    window.location.href = '/';

  };

 

  const handleNavigate = (tab: string): void => {

    setActiveTab(tab);

  };

 

  const handleFilterChange = (filters: FilterState): void => {

    setAudioFilesFilters(filters);

  };




  const renderMainContent = () => {

    switch (activeTab) {

      case 'audio':

      case 'audiofiles':

        return <AudioFilesPage filters={audioFilesFilters} />;

      case 'transcription':

        return <TranscriptsPage uploadState={uploadState} setUploadState={setUploadState} />;

      case 'chat':

      case 'chathistory':

        return <ChatHistoryPage />;

      case 'home':

      default:

        return <HomePage onNavigate={handleNavigate} />;

    }

  };

 

  if (isLoading) {

    return (

      <div className="loading-screen">

        <div className="loading-content">

          <div className="elevance-logo">

            <span className="logo-text">Elevance</span>

            <span className="logo-subtext">Health</span>

          </div>

          <div className="loading-spinner"></div>

          <div style={{ color: '#4299e1', fontSize: '1rem', marginTop: '1rem' }}>Loading...</div>

        </div>

      </div>

    );

  }

 

  const renderContent = () => {

    if (showGroupSelection) {

      return (

        <GroupSelectionPage

          user={currentUser!}

          onGroupSelected={handleGroupSelected}

        />

      );

    }

 

    return (

      <div className="clarityai-app-container" style={{ display: 'flex', minHeight: '100vh', backgroundColor: '#050716', overflow: 'hidden', width: '100%' }}>

        {/* Left vertical sidebar (collapsible on mobile) */}
        <Sidebar 
          activeTab={activeTab} 
          onNavigate={(tab) => {
            handleNavigate(tab);
            setIsMobileSidebarOpen(false);
          }}
          isMobileOpen={isMobileSidebarOpen}
          onCloseMobile={() => setIsMobileSidebarOpen(false)}
        />

        {/* Right side container */}
        <div className="right-main-container" style={{ display: 'flex', flexDirection: 'column', flex: 1, height: '100vh', overflow: 'hidden', minWidth: 0, width: '100%' }}>

          {/* Top horizontal nav header */}
          <MainContent

            user={currentUser || undefined}

            onLogout={handleLogout}

            onNavigate={(tab) => {
              handleNavigate(tab);
              setIsMobileSidebarOpen(false);
            }}

            activeTab={activeTab}

            onToggleMobileMenu={() => setIsMobileSidebarOpen(prev => !prev)}

          />

          {/* Main page content area */}
          <div className="main-content-scrollable" style={{ flex: 1, overflowY: 'auto', background: 'radial-gradient(circle at 80% 20%, #0d122b 0%, #050716 100%)', display: 'flex', flexDirection: 'column' }}>

            <div className={`clarityai-main-layout`} style={{ display: 'flex', minHeight: '100%', width: '100%', flex: 1 }}>
              <div style={{ flex: 1, width: '100%', display: 'flex', flexDirection: 'column' }}>
                {renderMainContent()}
              </div>
            </div>

          </div>

        </div>

      </div>

    );

  };

 

  return (

    <ThemeProvider>

      <ToastContainer>

        {renderContent()}

      </ToastContainer>

    </ThemeProvider>

  );

};

 

const App: React.FC = () => {
  useEffect(() => {
    try {
      fetchInterceptor();
    } catch {
      // Ignore fetch interceptor errors in local dev mode
    }
  }, []);

  return (
    <Router>
      <Switch>
        <Route path="/">
          <AuthProvider>
            <ClarityAIApp />
          </AuthProvider>
        </Route>
      </Switch>
    </Router>
  );
};

 

export default App;

 

 

 

 

 

 

 
