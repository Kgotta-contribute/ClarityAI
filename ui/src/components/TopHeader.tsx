
import React, { useState, useEffect } from 'react';

import { Header } from 'design-language';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { faUser, faSun, faMoon } from '@fortawesome/free-solid-svg-icons';

import { useTheme } from '../hooks/useTheme';

import { getSSOUserInfo, getSelectedBusinessGroup } from '../utils/authHeaders';

import "./styles/index.css";

 

interface User {

  id: string;

  name: string;

  email: string;

  department: string;

  role: string;

}

 

interface TopHeaderProps {

  user?: User | null;

  onLogout?: () => void;

  pageType?: 'login' | 'group-selection' | 'main';

  showNavigation?: boolean;

  showThemeToggle?: boolean;

  showUserInfo?: boolean;

}

 

const TopHeader: React.FC<TopHeaderProps> = ({

  user,

  onLogout,

  pageType = 'main',

  showNavigation = true,

  showThemeToggle = true,

  showUserInfo = true

}) => {

  const { toggleTheme, isDark } = useTheme();

  const [ssoUserInfo, setSSOUserInfo] = useState<{

    displayName: string;

    domainID: string;

    email: string;

    groups: string[];

  } | null>(null);

  useEffect(() => {

    // Fetch SSO user info from sessionStorage

    const userInfo = getSSOUserInfo();

    if (userInfo) {

      setSSOUserInfo(userInfo);

    }

 

    // Fetch selected business group

    getSelectedBusinessGroup();

  }, []);

 

  return (

    <Header className="clarityai-top-header" style={{ background: "#121938" }}>
      <div className="header-left">

        <div className="elevance-logo">

          <span className="header-logo-text">Elevance</span>

          <span className="logo-subtext">Health</span>

        </div>

      </div>

 

      <div className="header-right">

        <div className="cx-insights" style={{ width: "100%" }}>

          <span style={{ display: "flex", gap: "10px" }}>

            <span className="cx-title">Clarity.AI</span>

          </span>

 

          {showUserInfo && (ssoUserInfo || user) && (

            <span className="user-name" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

              <FontAwesomeIcon icon={faUser} className="header-icon" />

              <span>

                {ssoUserInfo

                  ? `${ssoUserInfo.displayName} (${ssoUserInfo.domainID})`

                  : pageType === 'group-selection'

                    ? `${user?.name} (${user?.id})`

                    : 'Clarity AI User'

                }

              </span>

              {ssoUserInfo && ssoUserInfo.groups && ssoUserInfo.groups.length > 0 && (

                <span style={{

                  fontSize: '0.8em',

                  padding: '3px 10px',

                  background: 'rgba(66, 153, 225, 0.25)',

                  borderRadius: '12px',

                  color: '#63b3ed',

                  fontWeight: '500',

                  whiteSpace: 'nowrap'

                }}>

                  {ssoUserInfo.groups.map(g =>

                    g.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

                  ).join(', ')}

                </span>

              )}

            </span>

          )}

 

          {showThemeToggle && (

            <span style={{ display: "flex", gap: "10px" }}>

              <button

                className="theme-toggle-btn"

                onClick={toggleTheme}

                title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}

              >

                <FontAwesomeIcon icon={isDark ? faSun : faMoon} />

              </button>

            </span>

          )}

        </div>

 

        {showNavigation && pageType === 'main' && (

          <div className="user-profile">

            <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>

              {['Home', 'Audio Files', 'Transcription', 'Chat', 'Settings'].map((item, index) => (

                <span

                  key={index}

                  style={{

                    fontWeight: index === 0 ? 'bold' : 'normal',

                    textDecoration: index === 0 ? 'underline' : 'none',

                    textUnderlineOffset: '5px',

                    cursor: 'pointer'

                  }}

                >

                  {item}

                </span>

              ))}

              <button

                onClick={onLogout}

                style={{

                  background: 'none',

                  border: 'none',

                  color: 'inherit',

                  cursor: 'pointer',

                  marginLeft: '20px'

                }}

              >

                Logout

              </button>

            </div>

          </div>

        )}

      </div>

    </Header>

  );

};

 

export default TopHeader;

 

 

 