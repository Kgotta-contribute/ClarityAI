
import React from 'react';

import { Header } from 'design-language';

import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import authService from '../services/authService';

import './styles/index.css';

 

interface NavItem {

  label: string;

  key: string;

}

 

interface NavigationBarProps {

  onLogout?: () => void;

  onNavigate?: (tab: string) => void;

  activeTab?: string;

}

 

const NavigationBar: React.FC<NavigationBarProps> = ({ onLogout, onNavigate, activeTab = 'home' }) => {

  const navItems: NavItem[] = [

    { label: 'Home', key: 'home' },

    { label: 'Audio Files', key: 'audio' },

    { label: 'Transcription', key: 'transcripts' },

    { label: 'Chat', key: 'chat' },

    { label: 'Settings', key: 'settings' }

  ];

 

  const handleNavClick = (tabKey: string) => {

    if (onNavigate) {

      onNavigate(tabKey);

    }

  };

 

  const handleLogout = (): void => {

    authService.logout();

    if (onLogout) {

      onLogout();

    } else {

      window.location.reload();

    }

  };

 

  return (

    <Header className="clarityai-navigation-header">

      <div className="nav-items-container">

        <div className="nav-menu">

          {navItems.map((item) => (

            <div

              key={item.key}

              className={`nav-item ${activeTab === item.key ? 'active' : ''}`}

              onClick={() => handleNavClick(item.key)}

              style={{ cursor: 'pointer' }}

            >

              {item.label}

            </div>

          ))}

        </div>

        <div className="nav-right">

          <button className="logout-nav-btn" onClick={handleLogout} title="Sign Out">

            <FontAwesomeIcon icon={faSignOutAlt} />

            <span>Logout</span>

          </button>

        </div>

      </div>

    </Header>

  );

};

 

export default NavigationBar;

 

 

 