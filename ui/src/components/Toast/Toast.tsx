
import React, { useEffect } from 'react';

 

export interface ToastMessage {

    id: string;

    message: string;

    type: 'success' | 'error' | 'warning' | 'info';

    duration?: number;

}

 

interface ToastProps {

    message: ToastMessage;

    onRemove: (id: string) => void;

}

 

const Toast: React.FC<ToastProps> = ({ message, onRemove }) => {

    useEffect(() => {

        const timer = setTimeout(() => {

            onRemove(message.id);

        }, message.duration || 5000);

 

        return () => clearTimeout(timer);

    }, [message.id, message.duration, onRemove]);

 

    const getToastStyles = () => {

        const baseStyles = {

            position: 'fixed' as const,

            top: '20px',

            right: '20px',

            padding: '12px 16px',

            borderRadius: '8px',

            color: 'white',

            fontSize: '14px',

            fontWeight: 'bold',

            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',

            zIndex: 9999,

            maxWidth: '400px',

            wordWrap: 'break-word' as const,

            animation: 'slideIn 0.3s ease-out',

            cursor: 'pointer'

        };

 

        const typeStyles = {

            success: { backgroundColor: '#4caf50' },

            error: { backgroundColor: '#f44336' },

            warning: { backgroundColor: '#ff9800' },

            info: { backgroundColor: '#2196f3' }

        };

 

        return { ...baseStyles, ...typeStyles[message.type] };

    };

 

    return (

        <>

            <style>

                {`

                    @keyframes slideIn {

                        from {

                            transform: translateX(100%);

                            opacity: 0;

                        }

                        to {

                            transform: translateX(0);

                            opacity: 1;

                        }

                    }

                `}

            </style>

            <div

                style={getToastStyles()}

                onClick={() => onRemove(message.id)}

                title="Click to dismiss"

            >

                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>

                    <span>

                        {message.type === 'success' && '✅'}

                        {message.type === 'error' && '❌'}

                        {message.type === 'warning' && '⚠️'}

                        {message.type === 'info' && 'ℹ️'}

                    </span>

                    <span>{message.message}</span>

                </div>

            </div>

        </>

    );

};

 

export default Toast;

 

 

 

 

 

 

 

 

 