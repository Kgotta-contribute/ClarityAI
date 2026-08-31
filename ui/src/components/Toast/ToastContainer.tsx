
import React, { useState, useCallback } from 'react';

import Toast, { type ToastMessage } from './Toast';

 

interface ToastContainerProps {

    children: React.ReactNode;

}

 

// Global toast state

let globalToastSetter: ((messages: ToastMessage[]) => void) | null = null;

let toastMessages: ToastMessage[] = [];

 

export const showToast = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', duration?: number) => {

    const newToast: ToastMessage = {

        id: Date.now().toString() + Math.random().toString(36).substr(2, 9),

        message,

        type,

        duration

    };

 

    toastMessages = [...toastMessages, newToast];

    if (globalToastSetter) {

        globalToastSetter([...toastMessages]);

    }

};

 

const ToastContainer: React.FC<ToastContainerProps> = ({ children }) => {

    const [messages, setMessages] = useState<ToastMessage[]>([]);

 

    // Register global setter

    React.useEffect(() => {

        globalToastSetter = setMessages;

        return () => {

            globalToastSetter = null;

        };

    }, []);

 

    const removeToast = useCallback((id: string) => {

        toastMessages = toastMessages.filter(msg => msg.id !== id);

        setMessages([...toastMessages]);

    }, []);

 

    return (

        <>

            {children}

            <div style={{ position: 'fixed', top: '20px', right: '20px', zIndex: 9999 }}>

                {messages.map((message, index) => (

                    <div key={message.id} style={{ marginBottom: index > 0 ? '8px' : '0' }}>

                        <Toast message={message} onRemove={removeToast} />

                    </div>

                ))}

            </div>

        </>

    );

};

 

export default ToastContainer;

 