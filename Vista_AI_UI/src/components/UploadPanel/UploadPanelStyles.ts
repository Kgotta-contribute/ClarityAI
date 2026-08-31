
import React from 'react';

 

export const styles: { [key: string]: React.CSSProperties } = {

    panel: {

        background: '#1a1a2e',

        borderRadius: 8,

        border: '1px solid #333',

        // overflow: 'auto',

        height: '100%',

        // width: '100%',

        // minHeight: 'calc(100vh - 95px)',

    },

    head: {

        background: '#121938',

        padding: '12px 16px',

        fontWeight: 600,

        color: '#fff',

        borderBottom: '1px solid #333',

    },

    body: {

        padding: 16,

    },

    row: {

        display: 'flex',

        gap: 16,

        flexWrap: 'wrap',

    },

    radioLabel: {

        display: 'flex',

        alignItems: 'center',

        gap: 6,

        color: '#cdcdcd',

        cursor: 'pointer',

    },

    uploader: {
        marginTop: 12,
        border: '1.5px dashed rgba(139, 92, 246, 0.45)',
        borderRadius: 14,
        padding: '32px 24px',
        textAlign: 'center',
        cursor: 'pointer',
        background: 'rgba(13, 17, 38, 0.4)',
        backdropFilter: 'blur(12px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.25s ease',
    },
    uploaderLabel: {
        color: '#ffffff',
        cursor: 'pointer',
        fontSize: '1.1rem',
        fontWeight: 600,
        marginTop: 4,
    },

    fileMeta: {

        marginTop: 6,

        color: '#888',

        fontSize: 12,

    },

    toggleRow: {

        display: 'flex',

        gap: 16,

        marginTop: 12,

        flexWrap: 'wrap',

    },

    toggleLabel: {

        flex: 1,

        display: 'flex',

        alignItems: 'center',

        // justifyContent: 'space-between',

        color: '#cdcdcd',

        fontSize: 13,

        minWidth: 120,

    },

    subLabel: {

        color: '#888',

        marginBottom: 6,

        fontSize: 12,

    },

    tokenInput: {

        display: 'flex',

        gap: 8,

    },

    input: {

        flex: 1,

        padding: '8px 12px',

        borderRadius: 4,

        border: '1px solid #444',

        background: '#0a0a0f',

        color: '#fff',

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

    btnSecondary: {

        background: '#444',

    },

    chips: {

        display: 'flex',

        gap: 6,

        flexWrap: 'wrap',

        marginTop: 8,

    },

    chip: {

        background: '#333',

        padding: '4px 10px',

        borderRadius: 12,

        fontSize: 12,

        color: '#cdcdcd',

    },

    toolbar: {

        marginTop: 16,

        display: 'flex',

        justifyContent: 'space-between',

        alignItems: 'center',

        flexWrap: 'wrap',

        gap: 12,

    },

    status: {

        color: '#888',

        fontSize: 13,

    },

    progressContainer: {

        marginTop: 12,

        height: 6,

        background: '#333',

        borderRadius: 3,

        overflow: 'hidden',

    },

    progressBar: {

        height: '100%',

        background: '#4a90d9',

        transition: 'width 0.3s',

    },

    progressMeta: {

        display: 'flex',

        justifyContent: 'space-between',

        fontSize: 12,

        color: '#888',

        marginTop: 4,

    },

    previewMeta: {

        display: 'flex',

        gap: 12,

        marginTop: 12,

    },

    pill: {

        background: '#333',

        padding: '4px 10px',

        borderRadius: 12,

        fontSize: 12,

        color: '#cdcdcd',

    },

    transcript: {

        marginTop: 12,

        minHeight: 100,

        background: '#0a0a0f',

        borderRadius: 4,

        padding: 12,

        color: '#cdcdcd',

        fontSize: 13,

    },

};

 

 

 