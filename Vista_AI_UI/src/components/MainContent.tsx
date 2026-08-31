
import React, { useState, useEffect } from "react";

import { useHistory } from 'react-router-dom';

import {

    IconButton,

    Select,

} from "design-language";

import { faIdBadge, faSun, faMoon } from "@fortawesome/free-solid-svg-icons";

import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { useTheme } from '../hooks/useTheme';

import { getSSOUserInfo, getSelectedBusinessGroup } from '../utils/authHeaders';

import { formatBusinessGroup, formatTabKey } from '../utils/stringUtils';

import { COLORS } from '../constants/colors';

import { POLLING_INTERVALS } from '../constants/ui';

import "./styles/ClarityAIStyles.css";

 

interface User {

    id: string;

    name: string;

    email: string;

    department: string;

    role: string;

}

 

interface Metadata {

    delegates?: string[];

}

 

interface MainContentProps {

    user?: User;

    metadata?: Metadata;

    accessibleLinks?: string[];

    activeTabView?: string;

    onLogout?: () => void;

    onNavigate?: (tab: string) => void;

    activeTab?: string;

    onToggleMobileMenu?: () => void;

}

 

const MainContent: React.FC<MainContentProps> = ({

    user = { id: 'AM63351', name: 'Clarity AI User', email: 'user@clarityai.com', department: 'Healthcare Operations', role: 'manager' },

    metadata = { delegates: [] },

    accessibleLinks = ['Home', 'Audio Files', 'Transcription', 'Chat', 'Settings'],

    onLogout,

    onNavigate,

    activeTab = 'home',

    onToggleMobileMenu

}) => {

    const [ssoUserInfo, setSSOUserInfo] = useState<{

        displayName: string;

        domainID: string;

        email: string;

        groups: string[];

    } | null>(null);

    const [selectedBusinessGroup, setSelectedBusinessGroup] = useState<string | null>(null);

 

    useEffect(() => {

        const updateUserInfo = () => {

            const userInfo = getSSOUserInfo();

            if (userInfo) {

                setSSOUserInfo(userInfo);

            }

            const businessGroup = getSelectedBusinessGroup();

            setSelectedBusinessGroup(businessGroup);

        };

 

        updateUserInfo();

 

        const handleStorageChange = (e: StorageEvent) => {

            if (e.key === 'clarity_selected_group' || e.key === 'okta_user_info') {

                updateUserInfo();

            }

        };

 

        window.addEventListener('storage', handleStorageChange);

 

        const interval = setInterval(updateUserInfo, POLLING_INTERVALS.USER_INFO_UPDATE);

 

        return () => {

            window.removeEventListener('storage', handleStorageChange);

            clearInterval(interval);

        };

    }, []);

 

    const getFilteredLinks = () => {

        const isAdmin = user?.role?.toLowerCase().includes('admin') || user?.role?.toLowerCase().includes('manager');

 

        if (isAdmin) {

            return accessibleLinks;

        } else {

            return accessibleLinks.filter(link => link !== 'Settings');

        }

    };

 

    const filteredLinks = getFilteredLinks();

    const { toggleTheme, isDark } = useTheme();

    const history = useHistory();

    const handleButtonClick = (tabTitle: string): void => {

        const tabKey = formatTabKey(tabTitle);

        if (onNavigate) {

            onNavigate(tabKey);

        }

    };

 

    const renderButtons = () => {

        return (

            <div style={{ padding: '0', display: 'flex', alignItems: 'center' }}>

                {filteredLinks.length > 0 && filteredLinks.map((tabTitle, index) => {

                    const isCurrent = activeTab === formatTabKey(tabTitle);

                    return (

                        <div

                            onClick={() => handleButtonClick(tabTitle)}

                            key={index}

                            style={{

                                fontWeight: isCurrent ? '600' : '500',

                                margin: '0 1.25rem',

                                paddingBottom: '0.4rem',

                                borderBottom: isCurrent ? '2px solid #3b82f6' : '2px solid transparent',

                                color: isCurrent ? '#ffffff' : '#94a3b8',

                                cursor: 'pointer',

                                fontSize: '0.95rem',

                                transition: 'all 0.25s ease'

                            }}

                        >

                            {tabTitle}

                        </div>

                    );

                })}


            </div>

        );

    };

 

    const renderRoleForm = () => {

        if (!metadata) {

            return null;

        }

 

        const actualName = ssoUserInfo?.displayName || user?.name || 'Clarity AI User';

        const actualId = ssoUserInfo?.domainID || user?.id || 'AM63351';

        const override = localStorage.getItem('user-override');

        const origDelegates = localStorage.getItem('fullOptions')?.split(',');

        const commonDelegates: string[] = [];

 

        if (override && origDelegates) {

            for (const delegate of origDelegates) {

                if (metadata?.delegates?.includes(delegate)) {

                    commonDelegates.push(delegate);

                }

            }

        }

 

        const selfAndOrOverride = override

            ? [`${actualName} (${actualId})`, override]

            : [`${actualName} (${actualId})`];

 

        const options = [

            ...selfAndOrOverride,

            ...(!override ? [...metadata?.delegates || []] : []),

            ...(commonDelegates || [])

        ];

 

        const selectedIndex = override && options.indexOf(override) !== -1 ? options.indexOf(override) : 0;

 

        return (

            <>

                <IconButton

                    icon={faIdBadge}

                    style={{ margin: '10px 0.25em 0' }}

                    title={'User Permissions'}

                />

                <Select

                    bare

                    filter={true}

                    defaultSelectedIndexes={[selectedIndex]}

                    onChange={(index: number) => {

                        if (index !== undefined && index !== null) {

                            localStorage.setItem("user-override", options[index] || '');

                            localStorage.setItem("fullOptions", options.join(','));

                        } else {

                            localStorage.removeItem("user-override");

                            localStorage.removeItem("fullOptions");

                        }

                        window.location.reload();

                    }}

                    options={options}

                    style={{ marginTop: '5px' }}

                />

                {selectedBusinessGroup && (

                    <span style={{

                        fontSize: '0.8em',

                        padding: '3px 10px',

                        background: 'rgba(144, 238, 144, 0.25)',

                        borderRadius: '12px',

                        color: COLORS.SUCCESS_GREEN,

                        fontWeight: '600',

                        whiteSpace: 'nowrap',

                        marginLeft: '10px'

                    }}>

                        {formatBusinessGroup(selectedBusinessGroup)}

                    </span>

                )}

            </>

        );

    };

 

    return (

        <React.Fragment>

            <div style={{

                background: isDark ? '#070919' : '#ffffff',

                color: isDark ? 'white' : '#0f172a',

                padding: '0.85rem 2rem',

                display: 'flex',

                justifyContent: 'space-between',

                alignItems: 'center',

                borderBottom: isDark ? '1px solid rgba(255, 255, 255, 0.05)' : '1px solid #e2e8f0',

                position: 'relative',

                height: '64px',

                boxSizing: 'border-box',

                transition: 'all 0.3s ease'

            }}>

                {/* Left side: Mobile Menu Toggle Button */}
                <div style={{ display: 'flex', alignItems: 'center' }}>
                    <button
                        className="mobile-hamburger-toggle"
                        onClick={onToggleMobileMenu}
                        title="Toggle Navigation Menu"
                        style={{
                            display: 'none',
                            alignItems: 'center',
                            justifyContent: 'center',
                            background: 'rgba(59, 130, 246, 0.15)',
                            border: '1px solid rgba(59, 130, 246, 0.3)',
                            color: '#60a5fa',
                            borderRadius: '8px',
                            width: '38px',
                            height: '38px',
                            fontSize: '20px',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease',
                            marginRight: '8px'
                        }}
                    >
                        ☰
                    </button>
                </div>

                {/* Centered Logo & Wave Graphic */}
                <div
                    onClick={() => onNavigate && onNavigate('home')}
                    className="header-logo-clickable"
                    style={{
                        position: 'absolute',
                        left: '50%',
                        top: '50%',
                        transform: 'translate(calc(-50% - 96px), -50%)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        cursor: 'pointer',
                        userSelect: 'none'
                    }}
                >
                    <svg width="28" height="24" viewBox="0 0 24 20" fill="none" style={{ filter: isDark ? 'drop-shadow(0 0 8px rgba(56, 189, 248, 0.5))' : 'none' }}>
                        <defs>
                            <linearGradient id="waveHeaderGrad" x1="0" y1="0" x2="0" y2="20" gradientUnits="userSpaceOnUse">
                                <stop offset="0%" stopColor="#38bdf8" />
                                <stop offset="100%" stopColor="#818cf8" />
                            </linearGradient>
                        </defs>
                        <rect x="2" y="6" width="2" height="8" rx="1" fill="url(#waveHeaderGrad)" />
                        <rect x="6" y="3" width="2" height="14" rx="1" fill="url(#waveHeaderGrad)" />
                        <rect x="10" y="1" width="2" height="18" rx="1" fill="url(#waveHeaderGrad)" />
                        <rect x="14" y="4" width="2" height="12" rx="1" fill="url(#waveHeaderGrad)" />
                        <rect x="18" y="7" width="2" height="6" rx="1" fill="url(#waveHeaderGrad)" />
                    </svg>
                    <span style={{
                        fontSize: '1.45rem',
                        fontWeight: '800',
                        letterSpacing: '0.5px',
                        color: isDark ? '#ffffff' : '#0f172a',
                        textShadow: isDark ? '0 0 15px rgba(56, 189, 248, 0.15)' : 'none',
                        transition: 'color 0.3s ease'
                    }}>
                        Clarity<span style={{ color: '#3b82f6' }}>.AI</span>
                    </span>
                </div>

                {/* Right side utilities */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>

                    <button
                        className="github-btn"
                        onClick={() => window.open('https://www.github.com/Kgotta-Contribute/', '_blank')}
                        title="Visit GitHub Repository"
                        style={{
                            background: isDark ? 'rgba(255, 255, 255, 0.08)' : '#f1f5f9',
                            border: isDark ? '1px solid rgba(255, 255, 255, 0.15)' : '1px solid #cbd5e1',
                            borderRadius: '8px',
                            color: isDark ? '#ffffff' : '#475569',
                            cursor: 'pointer',
                            padding: '6px 12px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '8px',
                            fontWeight: 500,
                            fontSize: '14px',
                            transition: 'all 0.2s ease'
                        }}
                    >
                        <svg height="18" width="18" viewBox="0 0 16 16" fill="currentColor" style={{ display: 'block' }}>
                            <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.28.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"/>
                        </svg>
                        <span>GitHub</span>
                    </button>

                    <button

                        className="theme-toggle-btn"

                        onClick={toggleTheme}

                        title={isDark ? "Switch to Light Mode" : "Switch to Dark Mode"}

                        style={{

                            background: 'rgba(66, 153, 225, 0.2)',

                            border: '1px solid rgba(66, 153, 225, 0.3)',

                            borderRadius: '8px',

                            color: COLORS.LIGHT_BLUE,

                            cursor: 'pointer',

                            padding: '8px 12px',

                            display: 'flex',

                            alignItems: 'center',

                            justifyContent: 'center',

                            transition: 'all 0.2s ease',

                            fontSize: '16px'

                        }}

                    >

                        <FontAwesomeIcon icon={isDark ? faSun : faMoon} />

                    </button>

                </div>

            </div>

        </React.Fragment>

    );

};

 

export default MainContent;

 

 

 

 