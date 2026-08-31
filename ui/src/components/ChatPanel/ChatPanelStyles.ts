
import React from 'react';

 

export const styles: { [key: string]: React.CSSProperties } = {

    panel: {
        background: 'rgba(9, 13, 30, 0.75)',
        borderRadius: 14,
        border: '1px solid rgba(255, 255, 255, 0.08)',
        overflow: 'hidden',
        height: '100%',
        width: '100%',
        maxWidth: '100%',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
        backdropFilter: 'blur(16px)',
    },
    head: {
        background: 'rgba(13, 20, 44, 0.85)',
        padding: '12px 20px',
        fontWeight: 600,
        color: '#ffffff',
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        backdropFilter: 'blur(12px)',
        position: 'relative',
        zIndex: 100,
    },
    fileScope: {
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        fontSize: 12,
    },
    fileScopeLabel: {
        color: '#94a3b8',
        fontWeight: 500,
    },
    body: {
        padding: 0,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        minHeight: 0,
    },
    chatShell: {
        display: 'flex',
        flex: 1,
        minHeight: 0,
    },
    chatSessions: {
        width: 220,
        borderRight: '1px solid rgba(255, 255, 255, 0.08)',
        display: 'flex',
        flexDirection: 'column',
        background: 'rgba(10, 14, 34, 0.65)',
        backdropFilter: 'blur(12px)',
    },
    sessionsTop: {
        padding: '14px',
        display: 'flex',
        gap: 8,
        borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
    },
    sessionsList: {
        flex: 1,
        overflowY: 'auto',
        padding: '8px 0',
    },
    sessionItem: {
        padding: '9px 12px',
        margin: '4px 10px',
        borderRadius: '8px',
        cursor: 'pointer',
        color: '#cbd5e1',
        fontSize: 13,
        border: '1px solid transparent',
        transition: 'all 0.2s ease',
    },
    sessionItemActive: {
        background: 'rgba(59, 130, 246, 0.15)',
        border: '1px solid rgba(59, 130, 246, 0.35)',
        color: '#ffffff',
        boxShadow: '0 2px 8px rgba(37, 99, 235, 0.2)',
    },

    chatMain: {

        flex: 1,

        display: 'flex',

        flexDirection: 'column',

        minHeight: 0,

    },

    chatLog: {

        flex: 1,

        overflowY: 'auto',

        padding: 12,

    },

    chatMessage: {

        marginBottom: 12,

        padding: 10,

        borderRadius: 8,

        fontSize: 13,

        lineHeight: 1.5,

    },

    userMessage: {

        background: '#4a90d9',

        color: '#fff',

        marginLeft: 40,

    },

    botMessage: {

        background: '#333',

        color: '#f0f0f0',

        marginRight: 40,

    },

    chatInput: {

        display: 'flex',

        gap: 8,

        padding: 12,

        borderTop: '1px solid #333',

        background: '#121938',

    },

    input: {

        flex: 1,

        padding: '10px 12px',

        borderRadius: 4,

        border: '1px solid #444',

        background: 'transparent',

        color: '#fff',

        fontSize: 14,

        outline: 'none',

        boxSizing: 'border-box',

    },

    btn: {

        padding: '8px 16px',

        borderRadius: 4,

        border: 'none',

        background: '#4a90d9',

        color: '#fff',

        cursor: 'pointer',

        fontWeight: 500,

    },

    btnGhost: {

        background: 'transparent',

        border: '1px solid #444',

        color: '#e8e8e8',

    },

    // Custom Dropdown Styles
    customDropdown: {
        position: 'relative',
        minWidth: 300,
        zIndex: 150,
    },
    dropdownTrigger: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '7px 14px',
        borderRadius: 8,
        border: '1px solid rgba(59, 130, 246, 0.4)',
        background: 'rgba(15, 23, 42, 0.85)',
        color: '#ffffff',
        fontSize: 12,
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    },
    dropdownText: {
        flex: 1,
        textAlign: 'left' as const,
        overflow: 'hidden',
        textOverflow: 'ellipsis',
        whiteSpace: 'nowrap' as const,
    },
    dropdownArrow: {
        marginLeft: 8,
        fontSize: 10,
        transition: 'transform 0.2s ease',
        color: '#60a5fa',
    },
    dropdownMenu: {
        position: 'absolute',
        top: '100%',
        left: 0,
        right: 0,
        marginTop: 6,
        background: '#0d142c',
        border: '1px solid rgba(59, 130, 246, 0.4)',
        borderRadius: 10,
        boxShadow: '0 16px 40px rgba(0, 0, 0, 0.85), 0 0 20px rgba(37, 99, 235, 0.25)',
        zIndex: 9999,
        maxHeight: 480,
        overflowY: 'auto' as const,
        animation: 'fadeIn 0.2s ease',
        backdropFilter: 'blur(16px)',
    },
    dropdownHeader: {

        display: 'flex',

        justifyContent: 'space-between',

        alignItems: 'center',

        padding: '12px 16px',

        borderBottom: '1px solid #333',

        fontSize: 12,

        fontWeight: 600,

        color: '#4a90d9',

        background: '#121938',

    },

    clearAllBtn: {

        padding: '4px 8px',

        fontSize: 10,

        background: 'transparent',

        border: '1px solid #444',

        borderRadius: 4,

        color: '#b8b8b8',

        cursor: 'pointer',

        transition: 'all 0.2s ease',

    },

    dropdownItem: {

        padding: '14px 16px',

        cursor: 'pointer',

        transition: 'all 0.2s ease',

        borderBottom: '1px solid #2a2a3e',

        minHeight: 'auto',

    },

    dropdownItemSelected: {

        background: 'linear-gradient(135deg, #4a90d9 0%, #357abd 100%)',

        borderLeft: '3px solid #4a90d9',

    },

    checkboxContainer: {

        display: 'flex',

        alignItems: 'flex-start',

        gap: 12,

        width: '100%',

    },

    customCheckbox: {

        width: 18,

        height: 18,

        borderRadius: 4,

        border: '2px solid #444',

        background: '#0a0a0f',

        display: 'flex',

        alignItems: 'center',

        justifyContent: 'center',

        transition: 'all 0.2s ease',

        flexShrink: 0,

        marginTop: 2,

    },

    customCheckboxChecked: {

        background: 'linear-gradient(135deg, #4a90d9 0%, #357abd 100%)',

        borderColor: '#4a90d9',

        boxShadow: '0 0 8px rgba(74, 144, 217, 0.3)',

    },

    checkmark: {

        color: '#fff',

        fontSize: 12,

        fontWeight: 'bold',

    },

    transcriptName: {

        color: '#e8e8e8',

        fontSize: 12,

        flex: 1,

    },

    dropdownEmptyState: {

        display: 'flex',

        flexDirection: 'column' as const,

        alignItems: 'center',

        padding: '24px 16px',

        color: '#888',

        fontSize: 12,

        textAlign: 'center' as const,

        gap: 8,

    },

    emptyIcon: {

        fontSize: 24,

        opacity: 0.5,

    },

    // Search input styles

    searchContainer: {

        padding: '12px 16px',

        borderBottom: '1px solid #333',

        background: '#121938',

    },

    searchInput: {

        width: '100%',

        padding: '8px 12px',

        borderRadius: 6,

        border: '1px solid #444',

        background: '#0a0a0f',

        color: '#fff',

        fontSize: 12,

        outline: 'none',

        transition: 'border-color 0.2s ease',

    },

    noResultsMessage: {

        padding: '16px',

        textAlign: 'center' as const,

        color: '#888',

        fontSize: 12,

        fontStyle: 'italic',

    },

};

 