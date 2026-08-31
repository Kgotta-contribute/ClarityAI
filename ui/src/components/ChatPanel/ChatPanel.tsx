
import { styles } from './ChatPanelStyles';

import React, { useState, useEffect, useRef } from 'react';

import { UploadService, type AllDataResponse, type ChatRequest, type ChatResponse } from '../../services/UploadService';

import ChatLoadingIndicator from './ChatLoadingIndicator';

import { useTheme } from '../../hooks/useTheme';

import type { ChatMessage, ChatSession, TranscriptOption, ChatPanelProps } from './ChatPanel.types';

import { PROMPT_ACTIONS, CONDITIONAL_ACTIONS } from './ChatPanel.types';

import { showToast } from '../Toast/ToastContainer';

const FormattedMarkdown: React.FC<{ content: string; isBot: boolean }> = ({ content, isBot }) => {
    if (!isBot) {
        return <div style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>{content}</div>;
    }

    const renderInline = (text: string) => {
        const brParts = text.split(/<br\s*\/?>/gi);
        return brParts.map((brPart, brIdx) => {
            const parts = brPart.split(/(\*\*.*?\*\*|`.*?`)/g);
            const inlineNodes = parts.map((part, index) => {
                if (part.startsWith('**') && part.endsWith('**') && part.length >= 4) {
                    return <strong key={index} style={{ fontWeight: 600, color: '#e3f2fd' }}>{part.slice(2, -2)}</strong>;
                }
                if (part.startsWith('`') && part.endsWith('`') && part.length >= 2) {
                    return (
                        <code key={index} style={{
                            background: 'rgba(255, 255, 255, 0.12)',
                            padding: '2px 6px',
                            borderRadius: '4px',
                            fontSize: '0.88em',
                            fontFamily: 'monospace'
                        }}>{part.slice(1, -1)}</code>
                    );
                }
                return part;
            });

            return (
                <React.Fragment key={brIdx}>
                    {brIdx > 0 && <br />}
                    {inlineNodes}
                </React.Fragment>
            );
        });
    };

    const lines = content.split('\n');
    const elements: React.ReactNode[] = [];
    let tableRows: string[] = [];
    let inTable = false;

    const flushTable = (key: number) => {
        if (tableRows.length === 0) return;
        const parsedRows = tableRows.map(r => 
            r.trim().replace(/^\||\|$/g, '').split('|').map(c => c.trim())
        );
        
        const headerRow = parsedRows[0] || [];
        const bodyRows = parsedRows.slice(1).filter(r => !r.every(c => /^:?-+:?$/.test(c)));

        elements.push(
            <div key={`table-${key}`} style={{ overflowX: 'auto', margin: '12px 0' }}>
                <table style={{
                    width: '100%',
                    borderCollapse: 'collapse',
                    fontSize: '12px',
                    textAlign: 'left',
                    borderRadius: '8px',
                    overflow: 'hidden',
                    border: '1px solid rgba(255, 255, 255, 0.15)',
                    background: 'rgba(0, 0, 0, 0.25)'
                }}>
                    <thead>
                        <tr style={{ background: 'rgba(33, 150, 243, 0.2)', borderBottom: '2px solid rgba(255, 255, 255, 0.2)' }}>
                            {headerRow.map((cell, cIdx) => (
                                <th key={cIdx} style={{ padding: '8px 10px', fontWeight: 600, color: '#90caf9' }}>
                                    {renderInline(cell)}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {bodyRows.map((r, rIdx) => (
                            <tr key={rIdx} style={{
                                borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
                                background: rIdx % 2 === 1 ? 'rgba(255, 255, 255, 0.04)' : 'transparent'
                            }}>
                                {r.map((cell, cIdx) => (
                                    <td key={cIdx} style={{ padding: '7px 10px' }}>
                                        {renderInline(cell)}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        );
        tableRows = [];
        inTable = false;
    };

    lines.forEach((line, idx) => {
        const trimmed = line.trim();

        if (trimmed.startsWith('|') && trimmed.endsWith('|')) {
            inTable = true;
            tableRows.push(trimmed);
            return;
        } else if (inTable) {
            flushTable(idx);
        }

        if (/^---+$|^\*\*\*+$|^___+$/.test(trimmed)) {
            elements.push(<hr key={idx} style={{ border: 'none', borderTop: '1px solid rgba(255, 255, 255, 0.15)', margin: '14px 0' }} />);
            return;
        }

        if (trimmed.startsWith('### ')) {
            elements.push(<h3 key={idx} style={{ fontSize: '15px', fontWeight: 700, margin: '14px 0 6px 0', color: '#64b5f6', borderBottom: '1px solid rgba(100, 181, 246, 0.2)', paddingBottom: '4px' }}>{renderInline(trimmed.slice(4))}</h3>);
            return;
        }
        if (trimmed.startsWith('## ')) {
            elements.push(<h2 key={idx} style={{ fontSize: '17px', fontWeight: 700, margin: '16px 0 8px 0', color: '#90caf9' }}>{renderInline(trimmed.slice(3))}</h2>);
            return;
        }
        if (trimmed.startsWith('# ')) {
            elements.push(<h1 key={idx} style={{ fontSize: '19px', fontWeight: 700, margin: '18px 0 10px 0', color: '#bbdefb' }}>{renderInline(trimmed.slice(2))}</h1>);
            return;
        }

        if (/^[-*+]\s+/.test(trimmed)) {
            elements.push(
                <div key={idx} style={{ display: 'flex', gap: '8px', margin: '4px 0', paddingLeft: '6px' }}>
                    <span style={{ color: '#64b5f6', fontWeight: 'bold' }}>•</span>
                    <div>{renderInline(trimmed.replace(/^[-*+]\s+/, ''))}</div>
                </div>
            );
            return;
        }

        const numMatch = trimmed.match(/^(\d+)\.\s+(.*)/);
        if (numMatch) {
            elements.push(
                <div key={idx} style={{ display: 'flex', gap: '8px', margin: '4px 0', paddingLeft: '6px' }}>
                    <span style={{ fontWeight: 600, color: '#64b5f6' }}>{numMatch[1]}.</span>
                    <div>{renderInline(numMatch[2])}</div>
                </div>
            );
            return;
        }

        if (trimmed) {
            elements.push(
                <p key={idx} style={{ margin: '4px 0', lineHeight: 1.55 }}>
                    {renderInline(line)}
                </p>
            );
        } else {
            elements.push(<div key={idx} style={{ height: '6px' }} />);
        }
    });

    if (inTable) {
        flushTable(lines.length);
    }

    return <div style={{ wordBreak: 'break-word' }}>{elements}</div>;
};

const ChatPanel: React.FC<ChatPanelProps> = ({

    transcripts = [],

    sessions: externalSessions,

    setSessions: externalSetSessions,

    activeSessionId: externalActiveSessionId,

    setActiveSessionId: externalSetActiveSessionId

}) => {

    const { theme, currentTheme } = useTheme();
    const isLight = currentTheme === 'light' || theme?.name === 'light';

    const getThemeStyle = (styleName: string) => {
        const baseStyle = styles[styleName] || {};

        switch (styleName) {
            case 'panel':
                return {
                    ...baseStyle,
                    background: isLight ? '#ffffff' : 'rgba(9, 13, 30, 0.75)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                    boxShadow: isLight ? '0 4px 20px rgba(0, 0, 0, 0.05)' : '0 8px 32px rgba(0, 0, 0, 0.3)',
                };
            case 'head':
                return {
                    ...baseStyle,
                    background: isLight ? '#f8fafc' : 'rgba(13, 20, 44, 0.85)',
                    color: isLight ? '#0f172a' : '#ffffff',
                    borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                };
            case 'chatSessions':
                return {
                    ...baseStyle,
                    background: isLight ? '#f8fafc' : 'rgba(10, 14, 34, 0.65)',
                    borderRight: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                };
            case 'sessionsTop':
                return {
                    ...baseStyle,
                    borderBottom: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                };
            case 'sessionItem':
                return {
                    ...baseStyle,
                    color: isLight ? '#475569' : '#cbd5e1',
                };
            case 'sessionItemActive':
                return {
                    ...baseStyle,
                    background: isLight ? '#ffffff' : 'rgba(59, 130, 246, 0.15)',
                    border: isLight ? '1px solid #bfdbfe' : '1px solid rgba(59, 130, 246, 0.35)',
                    color: isLight ? '#1d4ed8' : '#ffffff',
                    boxShadow: isLight ? '0 2px 8px rgba(37, 99, 235, 0.12)' : '0 2px 8px rgba(37, 99, 235, 0.2)',
                };
            case 'botMessage':
                return {
                    ...baseStyle,
                    background: isLight ? '#f8fafc' : 'rgba(13, 20, 44, 0.75)',
                    border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                    color: isLight ? '#0f172a' : '#ffffff',
                };
            case 'chatMain':
                return {
                    ...baseStyle,
                    background: isLight ? '#ffffff' : 'transparent',
                };
            case 'fileScopeLabel':
                return {
                    ...baseStyle,
                    color: isLight ? '#475569' : '#94a3b8',
                };
            default:
                return baseStyle;
        }
    };

 

    const [apiTranscripts, setApiTranscripts] = useState<TranscriptOption[]>([]);

    const [isLoading, setIsLoading] = useState(true);

    const [error, setError] = useState<string | null>(null);
    const [isSendingMessage, setIsSendingMessage] = useState(false);
    const [copiedMessageId, setCopiedMessageId] = useState<string | null>(null);
    const [isMobileSessionsOpen, setIsMobileSessionsOpen] = useState<boolean>(false);
    const [cooldownSeconds, setCooldownSeconds] = useState<number>(0);

    useEffect(() => {
        if (cooldownSeconds <= 0) return;
        const timer = setInterval(() => {
            setCooldownSeconds(prev => Math.max(0, prev - 1));
        }, 1000);
        return () => clearInterval(timer);
    }, [cooldownSeconds]);

    const handleCopyMessage = (msgId: string, text: string) => {
        navigator.clipboard.writeText(text);
        setCopiedMessageId(msgId);
        showToast('success', 'Answer copied to clipboard!');
        setTimeout(() => {
            setCopiedMessageId(null);
        }, 2000);
    };

    const handleDeleteSession = (sessionId: string, e: React.MouseEvent) => {
        e.stopPropagation();
        if (sessions.length <= 1) {
            setSessions([{ id: '1', name: 'Chat 1', messages: [], scope: [] }]);
            setActiveSessionId('1');
            showToast('info', 'Session reset.');
            return;
        }
        const filtered = sessions.filter(s => s.id !== sessionId);
        setSessions(filtered);
        if (activeSessionId === sessionId) {
            setActiveSessionId(filtered[0].id);
        }
        showToast('success', 'Chat session deleted.');
    };

 

    useEffect(() => {

        const loadTranscripts = async () => {

            try {

                setIsLoading(true);

                setError(null);

 

                const allDataResponse: AllDataResponse = await UploadService.getAllData();

                console.log("allDataResponse", allDataResponse.records);

                const transformedTranscripts: TranscriptOption[] = allDataResponse.records

                    .filter((item) => item.fileStatus === 'completed')

                    .map((item) => ({

                        id: item.fileID,

                        name: item.fileName,

                        content: `Transcript content for ${item.fileName}`,

                        jobID: item.jobID,

                        fileID: item.fileID,

                        fileName: item.fileName,

                        sizeBytes: item.sizeBytes,

                        fileStatus: item.fileStatus,

                        userName: item.userName,

                        domainID: item.domainID,

                        businessGroup: item.businessGroup,

                        status: item.status,

                        receivedAt: item.receivedAt,

                        sourceFileName: item.sourceFileName

                    }));

 

                setApiTranscripts(transformedTranscripts);

            } catch (err) {

                console.error('Error loading transcripts:', err);

                setError(err instanceof Error ? err.message : 'Failed to load transcripts');

                setApiTranscripts([]);

            } finally {

                setIsLoading(false);

            }

        };

 

        loadTranscripts();

    }, []);

 

    const availableTranscripts = transcripts.length > 0 ? transcripts : apiTranscripts;

 

    const [internalSessions, setInternalSessions] = useState<ChatSession[]>([

        { id: '1', name: 'Chat 1', messages: [], scope: [] }

    ]);

    const [internalActiveSessionId, setInternalActiveSessionId] = useState('1');

    const sessions = externalSessions ?? internalSessions;

    const setSessions = externalSetSessions ?? setInternalSessions;

    const activeSessionId = externalActiveSessionId ?? internalActiveSessionId;

    const setActiveSessionId = externalSetActiveSessionId ?? setInternalActiveSessionId;

    const [inputValue, setInputValue] = useState('');

    const [isDropdownOpen, setIsDropdownOpen] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');

    const [downloadingSessionId, setDownloadingSessionId] = useState<string | null>(null);

    const dropdownRef = useRef<HTMLDivElement>(null);

    const searchInputRef = useRef<HTMLInputElement>(null);

    const activeSession = sessions.find(s => s.id === activeSessionId);

    const selectedScope = activeSession?.scope || [];

 

    // Helper function to format date and time

    const formatDateTime = (dateString: string) => {

        if (!dateString) return '';

        try {

            const date = new Date(dateString);

            const dateOptions: Intl.DateTimeFormatOptions = {

                month: 'short',

                day: 'numeric',

                year: 'numeric'

            };

            const timeOptions: Intl.DateTimeFormatOptions = {

                hour: 'numeric',

                minute: '2-digit',

                hour12: true

            };

            const formattedDate = date.toLocaleDateString('en-US', dateOptions);

            const formattedTime = date.toLocaleTimeString('en-US', timeOptions);

            return `${formattedDate} at ${formattedTime}`;

        } catch (error) {

            return dateString; // Return original string if parsing fails

        }

    };

 

    const filteredTranscripts = availableTranscripts.filter(transcript =>

        transcript.name.toLowerCase().includes(searchQuery.toLowerCase())

    );

 

    useEffect(() => {

        const handleClickOutside = (event: MouseEvent) => {

            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {

                setIsDropdownOpen(false);

                setSearchQuery('');

            }

        };

 

        document.addEventListener('mousedown', handleClickOutside);

        return () => {

            document.removeEventListener('mousedown', handleClickOutside);

        };

    }, []);

 

    useEffect(() => {

        if (isDropdownOpen && searchInputRef.current) {

            setTimeout(() => {

                searchInputRef.current?.focus();

            }, 100);

        }

    }, [isDropdownOpen]);

 

    const handleNewChat = () => {

        const newId = Date.now().toString();

        setSessions([...sessions, {

            id: newId,

            name: `Chat ${sessions.length + 1}`,

            messages: [],

            scope: selectedScope

        }]);

        setActiveSessionId(newId);

    };

 

    const extractTextFromResponse = (data: any): string => {

        if (typeof data === 'string') {

            return data.trim();

        }

 

        const textFields = ['response', 'answer', 'text', 'message', 'content', 'result'];

        for (const field of textFields) {

            if (data[field] && typeof data[field] === 'string') {

                return data[field].trim();

            }

        }

 

        if (typeof data === 'object') {

            return 'Response received but no readable text content found.';

        }

 

        return String(data).trim();

    };

 

    const handleSendMessage = async () => {
        if (!inputValue.trim() || !activeSession || isSendingMessage) return;

        if (cooldownSeconds > 0) {
            showToast('warning', `⏳ Rate limit active: please wait ${cooldownSeconds}s before sending next question.`, 4000);
            return;
        }

        const selectedTranscripts = availableTranscripts.filter(t => selectedScope.includes(t.id));

 

        // Check if no files are selected in chat scope

        if (selectedTranscripts.length === 0) {

            alert('Please select at least one file from the chat scope before sending a message.');

            return;

        }

 

        setIsSendingMessage(true);

 

        const userMessage: ChatMessage = {

            id: Date.now().toString(),

            role: 'user',

            content: inputValue

        };

 

        setSessions(sessions.map(s =>

            s.id === activeSessionId

                ? { ...s, messages: [...s.messages, userMessage] }

                : s

        ));

 

        const currentInput = inputValue;

        setInputValue('');

 

        try {

            const getConversationHistory = () => {

                const messages = activeSession?.messages || [];

                const conversationPairs: Array<{ user: string, agent: string }> = [];

 

                for (let i = 0; i < messages.length - 1; i += 2) {

                    const userMsg = messages[i];

                    const botMsg = messages[i + 1];

 

                    if (userMsg?.role === 'user' && botMsg?.role === 'bot') {

                        conversationPairs.push({

                            user: userMsg.content,

                            agent: botMsg.content

                        });

                    }

                }

 

                return conversationPairs.slice(-3);

            };

 

            const files = selectedTranscripts.length > 0

                ? selectedTranscripts

                    .filter(transcript => transcript.jobID) // Only include transcripts with jobID

                    .map(transcript => ({

                        fileId: transcript.id,

                        jobId: transcript.jobID!

                    }))

                : [];

 

            const payload: ChatRequest = {

                conversationHistory: getConversationHistory(),

                userQuestion: currentInput,

                files: files

            };

 

            const data: ChatResponse = await UploadService.sendChatMessage(payload);

            if (data && (data.is_rate_limited || (data as any).retry_after)) {
                const retrySec = (data as any).retry_after || 30;
                setCooldownSeconds(retrySec);
                showToast('warning', `⏳ Rate limit active: maximum 2 questions/minute. Please wait ${retrySec}s.`, 6000);
            }

            const botMessage: ChatMessage = {

                id: (Date.now() + 1).toString(),

                role: 'bot',

                content: extractTextFromResponse(data)

            };

 

            setSessions(prev => prev.map(s =>

                s.id === activeSessionId

                    ? { ...s, messages: [...s.messages, botMessage] }

                    : s

            ));

 

        } catch (error) {

            console.error('Error sending message:', error);

            const errorMessage: ChatMessage = {

                id: (Date.now() + 2).toString(),

                role: 'bot',

                content: 'Sorry, there was an error processing your request. Please try again.'

            };

 

            setSessions(prev => prev.map(s =>

                s.id === activeSessionId

                    ? { ...s, messages: [...s.messages, errorMessage] }

                    : s

            ));

        } finally {

            setIsSendingMessage(false);

        }

    };

 

    const handleKeyPress = (e: React.KeyboardEvent) => {

        if (e.key === 'Enter' && !isSendingMessage) {

            handleSendMessage();

        }

    };

 

    const handlePromptClick = async (prompt: string) => {
        if (isSendingMessage || !activeSession) return;

        if (cooldownSeconds > 0) {
            showToast('warning', `⏳ Rate limit active: please wait ${cooldownSeconds}s before using quick actions.`, 4000);
            return;
        }

        // Set the input value and immediately send the message
        setInputValue(prompt);

 

        const selectedTranscripts = availableTranscripts.filter(t => selectedScope.includes(t.id));

        if (selectedTranscripts.length === 0) {
            showToast('Please select at least one transcript from the Chat scope before using quick actions.', 'warning', 6000);
            return;
        }

 

        setIsSendingMessage(true);

 

        const userMessage: ChatMessage = {

            id: Date.now().toString(),

            role: 'user',

            content: prompt

        };

 

        setSessions(sessions.map(s =>

            s.id === activeSessionId

                ? { ...s, messages: [...s.messages, userMessage] }

                : s

        ));

 

        try {

            const getConversationHistory = () => {

                const messages = activeSession?.messages || [];

                const conversationPairs: Array<{ user: string, agent: string }> = [];

 

                for (let i = 0; i < messages.length - 1; i += 2) {

                    const userMsg = messages[i];

                    const botMsg = messages[i + 1];

 

                    if (userMsg?.role === 'user' && botMsg?.role === 'bot') {

                        conversationPairs.push({

                            user: userMsg.content,

                            agent: botMsg.content

                        });

                    }

                }

 

                return conversationPairs.slice(-3);

            };

 

            const files = selectedTranscripts
                    .filter(transcript => transcript.jobID)
                    .map(transcript => ({
                        fileId: transcript.id,
                        jobId: transcript.jobID!
                    }));

            if (files.length === 0) {
                showToast('The selected transcript(s) are still processing or have not been transcribed yet. Please wait for transcription to complete before chatting.', 'warning', 7000);
                setIsSendingMessage(false);
                return;
            }

            const payload: ChatRequest = {
                conversationHistory: getConversationHistory(),
                userQuestion: prompt,
                files: files
            };

 

            const data: ChatResponse = await UploadService.sendChatMessage(payload);

            if (data && (data.is_rate_limited || (data as any).retry_after)) {
                const retrySec = (data as any).retry_after || 30;
                setCooldownSeconds(retrySec);
                showToast('warning', `⏳ Rate limit active: maximum 2 questions/minute. Please wait ${retrySec}s.`, 6000);
            }

            const botMessage: ChatMessage = {

                id: (Date.now() + 1).toString(),

                role: 'bot',

                content: extractTextFromResponse(data)

            };

 

            setSessions(prev => prev.map(s =>

                s.id === activeSessionId

                    ? { ...s, messages: [...s.messages, botMessage] }

                    : s

            ));

            setInputValue('');

        } catch (error) {

            console.error('Error sending message:', error);

            setSessions(prev => prev.map(s =>

                s.id === activeSessionId

                    ? { ...s, messages: s.messages.slice(0, -1) }

                    : s

            ));

        } finally {

            setIsSendingMessage(false);

        }

    };




    const downloadChatHistory = async (session: ChatSession) => {

        if (session.messages.length === 0) {

            const confirmed = window.confirm(`"${session.name}" has no messages to download. Would you like to download an empty chat template instead?`);

            if (!confirmed) return;

        }

 

        setDownloadingSessionId(session.id);

 

        try {

            await new Promise(resolve => setTimeout(resolve, 500));

 

            const chatContent = [

                `Chat History: ${session.name}`,

                `Downloaded: ${new Date().toLocaleString()}`,

                `Total Messages: ${session.messages.length}`,

                `Chat ID: ${session.id}`,

                '',

                '='.repeat(60),

                ''

            ];

 

            if (session.messages.length > 0) {

                session.messages.forEach((message, index) => {

                    const timestamp = new Date().toLocaleString(); // In real app, you'd store message timestamps

                    const role = message.role === 'user' ? 'User' : 'AI Assistant';

 

                    chatContent.push(`[${index + 1}] ${role} - ${timestamp}`);

                    chatContent.push('-'.repeat(40));

                    chatContent.push(message.content);

                    chatContent.push('');

                });

            } else {

                chatContent.push('No messages in this chat yet.');

                chatContent.push('');

            }

 

            if (session.scope && session.scope.length > 0) {

                chatContent.push('');

                chatContent.push('Chat Scope (Selected Transcripts):');

                chatContent.push('-'.repeat(40));

                session.scope.forEach(scopeId => {

                    const transcript = availableTranscripts.find(t => t.id === scopeId);

                    if (transcript) {

                        chatContent.push(`• ${transcript.name}`);

                        if (transcript.receivedAt) {

                            chatContent.push(`  Received: ${formatDateTime(transcript.receivedAt)}`);

                        }

                    }

                });

            } else {

                chatContent.push('');

                chatContent.push('Chat Scope: No transcripts selected');

            }

 

            // Create and download file

            const content = chatContent.join('\n');

            const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });

            const url = window.URL.createObjectURL(blob);

            const link = document.createElement('a');

            link.href = url;

 

            // Better filename with timestamp

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').split('T')[0];

            const safeName = session.name.replace(/[^a-z0-9\s]/gi, '').replace(/\s+/g, '_').toLowerCase();

            link.download = `chat_${safeName}_${timestamp}.txt`;

 

            document.body.appendChild(link);

            link.click();

            document.body.removeChild(link);

            window.URL.revokeObjectURL(url);

 

            // Success feedback

            setTimeout(() => {

                setDownloadingSessionId(null);

            }, 1000);

 

        } catch (error) {

            console.error('Download failed:', error);

            alert('Failed to download chat history. Please try again.');

            setDownloadingSessionId(null);

        }

    };

 

    const toggleTranscriptSelection = (transcriptId: string) => {

        let newScope;

 

        if (selectedScope.includes(transcriptId)) {

            newScope = selectedScope.filter(id => id !== transcriptId);

        } else {

            if (selectedScope.length < 2) {

                newScope = [...selectedScope, transcriptId];

            } else {

                alert('You can select a maximum of 2 transcripts for chat.');

                return;

            }

        }

 

        setSessions(sessions.map(s =>

            s.id === activeSessionId ? { ...s, scope: newScope } : s

        ));

    };

 

    const getSelectedTranscriptNames = () => {

        if (selectedScope.length === 0) return 'No transcripts selected (max 2)';

        if (selectedScope.length === 1) {

            const transcript = availableTranscripts.find(t => t.id === selectedScope[0]);

            return transcript?.name || 'Unknown transcript';

        }

        if (selectedScope.length === 2) {

            const transcript1 = availableTranscripts.find(t => t.id === selectedScope[0]);

            const transcript2 = availableTranscripts.find(t => t.id === selectedScope[1]);

            return `${transcript1?.name || 'Unknown'} + ${transcript2?.name || 'Unknown'} `;

        }

        return `${selectedScope.length} transcripts selected`;

    };

 

    return (

        <aside className="chat-panel-container" style={getThemeStyle('panel')}>
            <style>{`
                @media (max-width: 900px) {
                    .chat-panel-container {
                        height: 100% !important;
                        min-height: 520px !important;
                    }
                    .chat-panel-head {
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 10px !important;
                        padding: 10px 14px !important;
                        height: auto !important;
                    }
                    .chat-panel-head-top {
                        display: flex;
                        align-items: center;
                        justify-content: space-between;
                        width: 100%;
                    }
                    .chat-panel-file-scope {
                        width: 100% !important;
                        flex-direction: column !important;
                        align-items: stretch !important;
                        gap: 6px !important;
                    }
                    .chat-panel-file-scope > div {
                        width: 100% !important;
                    }
                    .chat-sessions-sidebar {
                        position: absolute !important;
                        left: 0 !important;
                        top: 0 !important;
                        bottom: 0 !important;
                        width: 250px !important;
                        z-index: 200 !important;
                        transform: translateX(-100%);
                        transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1);
                        box-shadow: 0 0 30px rgba(0,0,0,0.85);
                        background: ${isLight ? '#ffffff' : '#090d1e'} !important;
                    }
                    .chat-sessions-sidebar.mobile-sessions-open {
                        transform: translateX(0) !important;
                    }
                    .chat-sessions-backdrop {
                        display: block !important;
                        position: absolute;
                        inset: 0;
                        background: rgba(0, 0, 0, 0.6);
                        backdrop-filter: blur(2px);
                        z-index: 190;
                        cursor: pointer;
                    }
                    .mobile-toggle-sessions-btn {
                        display: inline-flex !important;
                    }
                    .chat-empty-state-scrollable {
                        padding: 16px 12px !important;
                        overflow-y: auto !important;
                        -webkit-overflow-scrolling: touch;
                    }
                    .chat-empty-title {
                        font-size: 1.25rem !important;
                    }
                    .chat-empty-subtitle {
                        font-size: 0.85rem !important;
                        margin-bottom: 16px !important;
                    }
                    .chat-quick-cards {
                        grid-template-columns: 1fr 1fr !important;
                        gap: 8px !important;
                    }
                    .chat-quick-card-item {
                        padding: 10px 12px !important;
                        gap: 8px !important;
                    }
                    .chat-input-container {
                        margin: 6px 10px 10px 10px !important;
                        padding: 8px 12px !important;
                    }
                }
                @media (max-width: 480px) {
                    .chat-quick-cards {
                        grid-template-columns: 1fr !important;
                        gap: 8px !important;
                    }
                }
                @media (min-width: 901px) {
                    .chat-sessions-backdrop {
                        display: none !important;
                    }
                    .mobile-toggle-sessions-btn {
                        display: none !important;
                    }
                }
            `}</style>

            <div className="chat-panel-head" style={getThemeStyle('head')}>
                <div className="chat-panel-head-top">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <button
                            type="button"
                            className="mobile-toggle-sessions-btn"
                            onClick={() => setIsMobileSessionsOpen(!isMobileSessionsOpen)}
                            title="Toggle Chat Sessions List"
                            style={{
                                display: 'none',
                                alignItems: 'center',
                                gap: '6px',
                                padding: '5px 10px',
                                borderRadius: '6px',
                                background: 'rgba(59, 130, 246, 0.15)',
                                border: '1px solid rgba(59, 130, 246, 0.3)',
                                color: '#60a5fa',
                                fontSize: '12px',
                                fontWeight: 600,
                                cursor: 'pointer'
                            }}
                        >
                            💬 Chats ({sessions.length})
                        </button>
                        <span>Chat with Transcript</span>
                    </div>
                </div>

                <div className="chat-panel-file-scope" style={styles.fileScope} title="Choose which transcript(s) to chat against">

                    <label style={getThemeStyle('fileScopeLabel')}>Chat scope:</label>

                    <div ref={dropdownRef} style={styles.customDropdown}>

                        <div

                            style={styles.dropdownTrigger}

                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}

                        >

                            <span style={styles.dropdownText}>

                                {getSelectedTranscriptNames()}

                            </span>

                            <span style={{

                                ...styles.dropdownArrow,

                                transform: isDropdownOpen ? 'rotate(180deg)' : 'rotate(0deg)'

                            }}>

                                ▼

                            </span>

                        </div>

 

                        {isDropdownOpen && (

                            <div style={styles.dropdownMenu}>

                                {isLoading ? (

                                    <div style={styles.dropdownEmptyState}>

                                        <span>🔄 Loading transcripts...</span>

                                    </div>

                                ) : error ? (

                                    <div style={styles.dropdownEmptyState}>

                                        <span style={styles.emptyIcon}>❌</span>

                                        <span>Error loading transcripts</span>

                                        <small style={styles.emptyHint}>{error}</small>

                                    </div>

                                ) : availableTranscripts.length === 0 ? (

                                    <div style={styles.dropdownEmptyState}>

                                        <span style={styles.emptyIcon}>📄</span>

                                        <span>No transcripts available</span>

                                        <small style={styles.emptyHint}>Upload files to see transcripts here</small>

                                    </div>

                                ) : (

                                    <>

                                        <div style={styles.dropdownHeader}>

                                            <span>Select Transcripts (Max 2)</span>

                                            {selectedScope.length > 0 && (

                                                <button

                                                    style={styles.clearAllBtn}

                                                    onClick={(e) => {

                                                        e.stopPropagation();

                                                        setSessions(sessions.map(s =>

                                                            s.id === activeSessionId ? { ...s, scope: [] } : s

                                                        ));

                                                    }}

                                                >

                                                    Clear All

                                                </button>

                                            )}

                                        </div>

 

                                        {/* Search Input */}

                                        <div style={styles.searchContainer}>

                                            <input

                                                ref={searchInputRef}

                                                type="text"

                                                placeholder="🔍 Search transcripts..."

                                                value={searchQuery}

                                                onChange={(e) => setSearchQuery(e.target.value)}

                                                style={styles.searchInput}

                                                onClick={(e) => e.stopPropagation()}

                                            />

                                        </div>

 

                                        {/* Transcript List */}

                                        {filteredTranscripts.length === 0 && searchQuery ? (

                                            <div style={styles.noResultsMessage}>

                                                No transcripts found matching "{searchQuery}"

                                            </div>

                                        ) : (

                                            filteredTranscripts.map(transcript => (

                                                <div

                                                    key={transcript.id}

                                                    style={{

                                                        ...styles.dropdownItem,

                                                        ...(selectedScope.includes(transcript.id) ? styles.dropdownItemSelected : {}),

                                                        ...(selectedScope.length >= 2 && !selectedScope.includes(transcript.id) ? { opacity: 0.5, cursor: 'not-allowed' } : {})

                                                    }}

                                                    onClick={(e) => {

                                                        e.stopPropagation();

                                                        toggleTranscriptSelection(transcript.id);

                                                    }}

                                                >

                                                    <div style={styles.checkboxContainer}>

                                                        <div style={{

                                                            ...styles.customCheckbox,

                                                            ...(selectedScope.includes(transcript.id) ? styles.customCheckboxChecked : {})

                                                        }}>

                                                            {selectedScope.includes(transcript.id) && (

                                                                <span style={styles.checkmark}>✓</span>

                                                            )}

                                                        </div>

                                                        <div style={{ flex: 1 }}>

                                                            <div style={styles.transcriptName}>

                                                                📄 {transcript.name}

                                                            </div>

                                                            {transcript.receivedAt && (

                                                                <div style={{

                                                                    fontSize: 11,

                                                                    color: selectedScope.includes(transcript.id)

                                                                        ? 'rgba(255, 255, 255, 0.8)'

                                                                        : theme.colors.textSecondary,

                                                                    marginTop: 3,

                                                                    fontStyle: 'italic',

                                                                    lineHeight: 1.2

                                                                }}>

                                                                    🕒 {formatDateTime(transcript.receivedAt)}

                                                                </div>

                                                            )}

                                                        </div>

                                                    </div>

                                                </div>

                                            ))

                                        )}

                                    </>

                                )}

                            </div>

                        )}

                    </div>

                </div>

            </div>

            <div style={getThemeStyle('body')}>

                <div style={{ ...getThemeStyle('chatShell'), position: 'relative' }}>

                    {isMobileSessionsOpen && (
                        <div 
                            className="chat-sessions-backdrop" 
                            onClick={() => setIsMobileSessionsOpen(false)} 
                        />
                    )}

                    <div className={`chat-sessions-sidebar ${isMobileSessionsOpen ? 'mobile-sessions-open' : ''}`} style={getThemeStyle('chatSessions')}>

                        <div style={getThemeStyle('sessionsTop')}>
                            <button
                                type="button"
                                style={{
                                    width: '100%',
                                    background: isLight ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)',
                                    border: isLight ? '1px solid #bfdbfe' : '1px solid rgba(59, 130, 246, 0.4)',
                                    color: isLight ? '#1d4ed8' : '#60a5fa',
                                    fontWeight: 600,
                                    fontSize: '13px',
                                    padding: '9px 14px',
                                    borderRadius: '10px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    cursor: 'pointer',
                                    boxShadow: isLight ? '0 2px 6px rgba(37, 99, 235, 0.1)' : '0 2px 10px rgba(37, 99, 235, 0.2)',
                                    transition: 'all 0.2s ease'
                                }}
                                onClick={() => {
                                    handleNewChat();
                                    setIsMobileSessionsOpen(false);
                                }}
                                onMouseEnter={(e) => {
                                    e.currentTarget.style.background = isLight ? 'linear-gradient(135deg, #dbeafe 0%, #bfdbfe 100%)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.4) 0%, rgba(59, 130, 246, 0.25) 100%)';
                                    e.currentTarget.style.borderColor = '#3b82f6';
                                    e.currentTarget.style.transform = 'translateY(-1px)';
                                    e.currentTarget.style.boxShadow = isLight ? '0 4px 10px rgba(37, 99, 235, 0.2)' : '0 4px 14px rgba(37, 99, 235, 0.4)';
                                }}
                                onMouseLeave={(e) => {
                                    e.currentTarget.style.background = isLight ? 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)' : 'linear-gradient(135deg, rgba(37, 99, 235, 0.25) 0%, rgba(59, 130, 246, 0.15) 100%)';
                                    e.currentTarget.style.borderColor = isLight ? '#bfdbfe' : 'rgba(59, 130, 246, 0.4)';
                                    e.currentTarget.style.transform = 'translateY(0)';
                                    e.currentTarget.style.boxShadow = isLight ? '0 2px 6px rgba(37, 99, 235, 0.1)' : '0 2px 10px rgba(37, 99, 235, 0.2)';
                                }}
                            >
                                <span style={{ fontSize: '15px' }}>+</span>
                                <span>New Chat</span>
                            </button>
                        </div>

                        <div style={styles.sessionsList}>
                            {sessions.map(session => (
                                <div
                                    key={session.id}
                                    style={{
                                        ...getThemeStyle('sessionItem'),
                                        ...(session.id === activeSessionId ? getThemeStyle('sessionItemActive') : {}),
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        padding: '8px 10px',
                                        gap: '6px'
                                    }}
                                >
                                    <span
                                        style={{
                                            flex: 1,
                                            cursor: 'pointer',
                                            overflow: 'hidden',
                                            textOverflow: 'ellipsis',
                                            whiteSpace: 'nowrap',
                                            fontWeight: session.id === activeSessionId ? 600 : 400,
                                            color: session.id === activeSessionId ? (isLight ? '#1d4ed8' : '#ffffff') : (isLight ? '#334155' : '#cbd5e1')
                                        }}
                                        onClick={() => {
                                            setActiveSessionId(session.id);
                                            setIsMobileSessionsOpen(false);
                                        }}
                                    >
                                        {session.name}
                                    </span>

                                    <div style={{ display: 'flex', gap: '3px', alignItems: 'center' }}>
                                        {/* Download button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                downloadChatHistory(session);
                                            }}
                                            disabled={downloadingSessionId === session.id}
                                            style={{
                                                padding: '4px 6px',
                                                fontSize: '11px',
                                                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                                                border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                color: isLight ? '#64748b' : '#94a3b8',
                                                cursor: downloadingSessionId === session.id ? 'not-allowed' : 'pointer',
                                                borderRadius: '5px',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(59, 130, 246, 0.25)';
                                                e.currentTarget.style.color = '#3b82f6';
                                                e.currentTarget.style.borderColor = 'rgba(59, 130, 246, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)';
                                                e.currentTarget.style.color = isLight ? '#64748b' : '#94a3b8';
                                                e.currentTarget.style.borderColor = isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)';
                                            }}
                                            title={`Download "${session.name}" chat history`}
                                        >
                                            {downloadingSessionId === session.id ? '⟳' : '📥'}
                                        </button>

                                        {/* Rename button */}
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                const newName = prompt('Enter new chat name:', session.name);
                                                if (newName && newName.trim()) {
                                                    setSessions(sessions.map(s =>
                                                        s.id === session.id ? { ...s, name: newName.trim() } : s
                                                    ));
                                                }
                                            }}
                                            style={{
                                                padding: '4px 6px',
                                                fontSize: '11px',
                                                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                                                border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                color: isLight ? '#64748b' : '#94a3b8',
                                                cursor: 'pointer',
                                                borderRadius: '5px',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(245, 158, 11, 0.25)';
                                                e.currentTarget.style.color = '#d97706';
                                                e.currentTarget.style.borderColor = 'rgba(245, 158, 11, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)';
                                                e.currentTarget.style.color = isLight ? '#64748b' : '#94a3b8';
                                                e.currentTarget.style.borderColor = isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)';
                                            }}
                                            title={`Rename "${session.name}" chat`}
                                        >
                                            ✎
                                        </button>

                                        {/* Delete button */}
                                        <button
                                            onClick={(e) => handleDeleteSession(session.id, e)}
                                            style={{
                                                padding: '4px 6px',
                                                fontSize: '11px',
                                                background: isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)',
                                                border: isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)',
                                                color: isLight ? '#64748b' : '#94a3b8',
                                                cursor: 'pointer',
                                                borderRadius: '5px',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.background = 'rgba(239, 68, 68, 0.25)';
                                                e.currentTarget.style.color = '#dc2626';
                                                e.currentTarget.style.borderColor = 'rgba(239, 68, 68, 0.4)';
                                            }}
                                            onMouseLeave={(e) => {
                                                e.currentTarget.style.background = isLight ? 'rgba(0, 0, 0, 0.04)' : 'rgba(255, 255, 255, 0.06)';
                                                e.currentTarget.style.color = isLight ? '#64748b' : '#94a3b8';
                                                e.currentTarget.style.borderColor = isLight ? '1px solid rgba(0, 0, 0, 0.08)' : '1px solid rgba(255, 255, 255, 0.1)';
                                            }}
                                            title={`Delete "${session.name}" chat`}
                                        >
                                            🗑️
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>

                    </div>

 

                    <div style={getThemeStyle('chatMain')}>
                        {(!activeSession || activeSession.messages.length === 0) ? (
                            /* Empty State Matching Image 1 */
                            <div className="chat-empty-state-scrollable" style={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                justifyContent: 'flex-start',
                                padding: '28px 20px',
                                textAlign: 'center',
                                width: '100%',
                                boxSizing: 'border-box',
                                overflowY: 'auto'
                            }}>
                                {/* Glowing Sparkle Star Icon Badge */}
                                <div style={{
                                    width: '60px',
                                    height: '60px',
                                    borderRadius: '50%',
                                    background: isLight ? 'radial-gradient(circle at 35% 35%, #dbeafe 0%, #eff6ff 100%)' : 'radial-gradient(circle at 35% 35%, #1e3a8a 0%, #0b1329 100%)',
                                    border: isLight ? '1px solid #bfdbfe' : '1px solid rgba(59, 130, 246, 0.4)',
                                    boxShadow: isLight ? '0 0 20px rgba(59, 130, 246, 0.15)' : '0 0 24px rgba(37, 99, 235, 0.45)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginBottom: '20px',
                                    color: isLight ? '#2563eb' : '#60a5fa'
                                }}>
                                    <svg width="28" height="28" viewBox="0 0 24 24" fill="currentColor">
                                        <path d="M12 2L14.5 9.5L22 12L14.5 14.5L12 22L9.5 14.5L2 12L9.5 9.5L12 2Z" />
                                        <path d="M18.5 2.5L19.5 5.5L22.5 6.5L19.5 7.5L18.5 10.5L17.5 7.5L14.5 6.5L17.5 5.5L18.5 2.5Z" opacity="0.65" />
                                    </svg>
                                </div>

                                <h2 className="chat-empty-title" style={{
                                    fontSize: '1.5rem',
                                    fontWeight: 700,
                                    color: isLight ? '#0f172a' : '#ffffff',
                                    margin: '0 0 10px 0',
                                    letterSpacing: '-0.01em'
                                }}>
                                    Start a conversation
                                </h2>

                                <p className="chat-empty-subtitle" style={{
                                    fontSize: '0.95rem',
                                    color: isLight ? '#64748b' : '#94a3b8',
                                    maxWidth: '520px',
                                    margin: '0 0 32px 0',
                                    lineHeight: 1.5
                                }}>
                                    Ask questions about your transcripts, get summaries, key insights, or explore next steps.
                                </p>

                                {/* 4 Quick Action Cards */}
                                <div className="chat-quick-cards" style={{
                                    display: 'grid',
                                    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
                                    gap: '14px',
                                    width: '100%',
                                    maxWidth: '820px'
                                }}>
                                    {/* Card 1: Summarize */}
                                    <div
                                        className="chat-quick-card-item"
                                        onClick={() => handlePromptClick('Summarize')}
                                        style={{
                                            background: isLight ? '#ffffff' : 'rgba(13, 20, 44, 0.65)',
                                            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 6px 16px rgba(37, 99, 235, 0.12)' : '0 6px 16px rgba(0, 0, 0, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.15)',
                                            border: isLight ? '1px solid #bfdbfe' : '1px solid rgba(59, 130, 246, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isLight ? '#2563eb' : '#60a5fa',
                                            flexShrink: 0
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                                                <polyline points="14 2 14 8 20 8" />
                                                <line x1="16" y1="13" x2="8" y2="13" />
                                                <line x1="16" y1="17" x2="8" y2="17" />
                                            </svg>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff' }}>Summarize</span>
                                            <span style={{ fontSize: '11px', color: isLight ? '#64748b' : '#94a3b8' }}>Get a summary</span>
                                        </div>
                                    </div>

                                    {/* Card 2: Key issues */}
                                    <div
                                        className="chat-quick-card-item"
                                        onClick={() => handlePromptClick('Key issues')}
                                        style={{
                                            background: isLight ? '#ffffff' : 'rgba(13, 20, 44, 0.65)',
                                            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#06b6d4';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 6px 16px rgba(6, 182, 212, 0.12)' : '0 6px 16px rgba(0, 0, 0, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: isLight ? '#ecfeff' : 'rgba(6, 182, 212, 0.15)',
                                            border: isLight ? '1px solid #a5f3fc' : '1px solid rgba(6, 182, 212, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isLight ? '#0891b2' : '#22d3ee',
                                            flexShrink: 0
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <circle cx="11" cy="11" r="8" />
                                                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                                            </svg>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff' }}>Key issues</span>
                                            <span style={{ fontSize: '11px', color: isLight ? '#64748b' : '#94a3b8' }}>Find key points</span>
                                        </div>
                                    </div>

                                    {/* Card 3: Next steps */}
                                    <div
                                        className="chat-quick-card-item"
                                        onClick={() => handlePromptClick('Next steps')}
                                        style={{
                                            background: isLight ? '#ffffff' : 'rgba(13, 20, 44, 0.65)',
                                            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#3b82f6';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 6px 16px rgba(37, 99, 235, 0.12)' : '0 6px 16px rgba(0, 0, 0, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: isLight ? '#eff6ff' : 'rgba(59, 130, 246, 0.15)',
                                            border: isLight ? '1px solid #bfdbfe' : '1px solid rgba(59, 130, 246, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isLight ? '#2563eb' : '#60a5fa',
                                            flexShrink: 0
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <polyline points="9 11 12 14 22 4" />
                                                <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
                                            </svg>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff' }}>Next steps</span>
                                            <span style={{ fontSize: '11px', color: isLight ? '#64748b' : '#94a3b8' }}>What to do next</span>
                                        </div>
                                    </div>

                                    {/* Card 4: Draft call notes */}
                                    <div
                                        className="chat-quick-card-item"
                                        onClick={() => handlePromptClick('Draft call notes')}
                                        style={{
                                            background: isLight ? '#ffffff' : 'rgba(13, 20, 44, 0.65)',
                                            border: isLight ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.08)',
                                            borderRadius: '12px',
                                            padding: '14px 16px',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '12px',
                                            cursor: 'pointer',
                                            textAlign: 'left',
                                            transition: 'all 0.2s ease',
                                            boxShadow: isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none',
                                            backdropFilter: 'blur(10px)'
                                        }}
                                        onMouseEnter={(e) => {
                                            e.currentTarget.style.borderColor = '#ec4899';
                                            e.currentTarget.style.transform = 'translateY(-2px)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 6px 16px rgba(236, 72, 153, 0.12)' : '0 6px 16px rgba(0, 0, 0, 0.3)';
                                        }}
                                        onMouseLeave={(e) => {
                                            e.currentTarget.style.borderColor = isLight ? '#e2e8f0' : 'rgba(255, 255, 255, 0.08)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                            e.currentTarget.style.boxShadow = isLight ? '0 2px 8px rgba(0, 0, 0, 0.04)' : 'none';
                                        }}
                                    >
                                        <div style={{
                                            width: '36px',
                                            height: '36px',
                                            borderRadius: '50%',
                                            background: isLight ? '#fdf2f8' : 'rgba(236, 72, 153, 0.15)',
                                            border: isLight ? '1px solid #fbcfe8' : '1px solid rgba(236, 72, 153, 0.3)',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            color: isLight ? '#db2777' : '#f472b6',
                                            flexShrink: 0
                                        }}>
                                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                                            </svg>
                                        </div>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                                            <span style={{ fontSize: '13px', fontWeight: 600, color: isLight ? '#0f172a' : '#ffffff' }}>Draft call notes</span>
                                            <span style={{ fontSize: '11px', color: isLight ? '#64748b' : '#94a3b8' }}>Generate notes</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            /* Messages List when active conversation exists */
                            <>
                                <div style={{
                                    ...getThemeStyle('chatLog'),
                                    padding: '20px',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    gap: '16px'
                                }}>
                                    {activeSession?.messages.map(msg => {
                                        const isBot = msg.role === 'bot';
                                        return (
                                            <div
                                                key={msg.id}
                                                style={{
                                                    display: 'flex',
                                                    gap: '12px',
                                                    flexDirection: isBot ? 'row' : 'row-reverse',
                                                    alignItems: 'flex-start'
                                                }}
                                            >
                                                {/* Avatar Badge */}
                                                <div style={{
                                                    width: '32px',
                                                    height: '32px',
                                                    borderRadius: '50%',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    flexShrink: 0,
                                                    background: isBot
                                                        ? 'radial-gradient(circle at 30% 30%, #2563eb, #1e1b4b)'
                                                        : 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
                                                    border: isBot ? '1px solid rgba(96, 165, 250, 0.4)' : 'none',
                                                    boxShadow: isBot ? '0 0 12px rgba(37, 99, 235, 0.4)' : '0 0 8px rgba(59, 130, 246, 0.3)',
                                                    color: '#ffffff',
                                                    fontSize: '13px'
                                                }}>
                                                    {isBot ? '✦' : '👤'}
                                                </div>

                                                {/* Bubble Content */}
                                                <div style={{
                                                    maxWidth: '82%',
                                                    display: 'flex',
                                                    flexDirection: 'column',
                                                    gap: '6px'
                                                }}>
                                                    <div style={{
                                                        background: isBot
                                                            ? 'rgba(13, 20, 44, 0.75)'
                                                            : 'linear-gradient(135deg, #1d4ed8 0%, #2563eb 100%)',
                                                        border: isBot ? '1px solid rgba(255, 255, 255, 0.1)' : 'none',
                                                        borderRadius: isBot ? '4px 16px 16px 16px' : '16px 4px 16px 16px',
                                                        padding: '12px 16px',
                                                        color: '#ffffff',
                                                        fontSize: '14px',
                                                        lineHeight: '1.6',
                                                        boxShadow: isBot
                                                            ? '0 4px 16px rgba(0, 0, 0, 0.2)'
                                                            : '0 4px 14px rgba(37, 99, 235, 0.35)',
                                                        backdropFilter: 'blur(10px)'
                                                    }}>
                                                        <FormattedMarkdown content={msg.content} isBot={isBot} />
                                                    </div>

                                                    {/* Bot Action Tools: Copy button & Source chip */}
                                                    {isBot && (
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', paddingLeft: '4px' }}>
                                                            <button
                                                                type="button"
                                                                onClick={() => handleCopyMessage(msg.id, msg.content)}
                                                                style={{
                                                                    background: 'rgba(255, 255, 255, 0.05)',
                                                                    border: '1px solid rgba(255, 255, 255, 0.1)',
                                                                    borderRadius: '6px',
                                                                    padding: '3px 8px',
                                                                    color: copiedMessageId === msg.id ? '#4ade80' : '#94a3b8',
                                                                    fontSize: '11px',
                                                                    cursor: 'pointer',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px',
                                                                    transition: 'all 0.2s ease'
                                                                }}
                                                                onMouseEnter={(e) => e.currentTarget.style.color = '#ffffff'}
                                                                onMouseLeave={(e) => e.currentTarget.style.color = copiedMessageId === msg.id ? '#4ade80' : '#94a3b8'}
                                                            >
                                                                {copiedMessageId === msg.id ? '✓ Copied' : '📋 Copy answer'}
                                                            </button>

                                                            {selectedScope.length > 0 && (
                                                                <span style={{
                                                                    fontSize: '11px',
                                                                    color: '#64748b',
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    gap: '4px'
                                                                }}>
                                                                    <span>📌 Grounded in {selectedScope.length} transcript{selectedScope.length > 1 ? 's' : ''}</span>
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        );
                                    })}
                                    {isSendingMessage && (
                                        <div style={{ padding: '8px 16px' }}>
                                            <ChatLoadingIndicator />
                                        </div>
                                    )}
                                </div>

                                <div style={{
                                    padding: '8px 16px',
                                    borderTop: `1px solid ${theme.colors.border}`,
                                    background: theme.colors.surface,
                                    display: 'flex',
                                    flexWrap: 'wrap',
                                    gap: '6px',
                                    alignItems: 'center'
                                }}>
                                    {[
                                        ...PROMPT_ACTIONS,
                                        ...(selectedScope.length === 2 ? CONDITIONAL_ACTIONS : [])
                                    ].map((prompt) => (
                                        <button
                                            key={prompt.id}
                                            onClick={() => handlePromptClick(prompt.text)}
                                            disabled={isSendingMessage}
                                            style={{
                                                padding: '4px 10px',
                                                fontSize: '11px',
                                                background: theme.colors.background,
                                                border: `1px solid ${theme.colors.border}`,
                                                borderRadius: '12px',
                                                color: theme.colors.text,
                                                cursor: isSendingMessage ? 'not-allowed' : 'pointer',
                                                transition: 'all 0.2s ease',
                                                display: 'flex',
                                                alignItems: 'center',
                                                gap: '5px',
                                                opacity: isSendingMessage ? 0.5 : 1
                                            }}
                                        >
                                            <span>{prompt.icon}</span>
                                            <span>{prompt.text}</span>
                                        </button>
                                    ))}
                                </div>
                            </>
                        )}

                        {/* Modern Chat Input Box */}
                        {cooldownSeconds > 0 && (
                            <div style={{
                                margin: '0 20px 6px 20px',
                                padding: '8px 14px',
                                background: isLight ? 'rgba(234, 179, 8, 0.12)' : 'rgba(234, 179, 8, 0.18)',
                                border: '1px solid rgba(234, 179, 8, 0.45)',
                                borderRadius: '10px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '8px',
                                color: isLight ? '#854d0e' : '#fef08a',
                                fontSize: '12px',
                                fontWeight: 500
                            }}>
                                <span style={{ fontSize: '14px' }}>⏳</span>
                                <span>Rate limit active (max 2 queries/min): please wait <strong>{cooldownSeconds}s</strong> before sending another prompt.</span>
                            </div>
                        )}

                        <div className="chat-input-container" style={{
                            margin: '8px 20px 14px 20px',
                            background: isLight ? '#ffffff' : 'rgba(13, 20, 44, 0.75)',
                            border: isLight ? '1px solid #cbd5e1' : '1px solid rgba(59, 130, 246, 0.3)',
                            borderRadius: '14px',
                            padding: '10px 16px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px',
                            backdropFilter: 'blur(16px)',
                            boxShadow: isLight ? '0 4px 16px rgba(0, 0, 0, 0.06)' : '0 4px 20px rgba(0, 0, 0, 0.25)'
                        }}>
                            <input
                                type="text"
                                placeholder={cooldownSeconds > 0 ? `Rate limit active: wait ${cooldownSeconds}s...` : "Ask about the transcript..."}
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyPress={handleKeyPress}
                                disabled={cooldownSeconds > 0}
                                style={{
                                    width: '100%',
                                    background: 'transparent',
                                    border: 'none',
                                    outline: 'none',
                                    color: isLight ? '#0f172a' : '#ffffff',
                                    fontSize: '14px',
                                    padding: '2px 0',
                                    opacity: cooldownSeconds > 0 ? 0.6 : 1
                                }}
                            />

                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'flex-end',
                                borderTop: isLight ? '1px solid #f1f5f9' : '1px solid rgba(255, 255, 255, 0.06)',
                                paddingTop: '8px',
                                gap: '14px'
                            }}>
                                <span style={{ fontSize: '12px', color: isLight ? '#64748b' : '#64748b' }}>
                                    {cooldownSeconds > 0 ? `Cooldown: ${cooldownSeconds}s` : 'Enter to send'}
                                </span>
                                <button
                                    type="button"
                                    onClick={handleSendMessage}
                                    disabled={isSendingMessage || !inputValue.trim() || cooldownSeconds > 0}
                                    style={{
                                        background: cooldownSeconds > 0 ? (isLight ? '#94a3b8' : '#475569') : 'linear-gradient(135deg, #2563eb 0%, #3b82f6 100%)',
                                        color: '#ffffff',
                                        border: 'none',
                                        borderRadius: '8px',
                                        padding: '7px 18px',
                                        fontSize: '13px',
                                        fontWeight: 600,
                                        cursor: isSendingMessage || !inputValue.trim() || cooldownSeconds > 0 ? 'not-allowed' : 'pointer',
                                        opacity: isSendingMessage || !inputValue.trim() || cooldownSeconds > 0 ? 0.6 : 1,
                                        display: 'inline-flex',
                                        alignItems: 'center',
                                        gap: '6px',
                                        boxShadow: cooldownSeconds > 0 ? 'none' : '0 2px 10px rgba(37, 99, 235, 0.4)',
                                        transition: 'all 0.2s ease'
                                    }}
                                    onMouseEnter={(e) => {
                                        if (!isSendingMessage && inputValue.trim() && cooldownSeconds <= 0) {
                                            e.currentTarget.style.boxShadow = '0 4px 14px rgba(37, 99, 235, 0.6)';
                                            e.currentTarget.style.transform = 'translateY(-1px)';
                                        }
                                    }}
                                    onMouseLeave={(e) => {
                                        if (cooldownSeconds <= 0) {
                                            e.currentTarget.style.boxShadow = '0 2px 10px rgba(37, 99, 235, 0.4)';
                                            e.currentTarget.style.transform = 'translateY(0)';
                                        }
                                    }}
                                >
                                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                                        <line x1="22" y1="2" x2="11" y2="13"></line>
                                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                                    </svg>
                                    <span>{isSendingMessage ? 'Sending...' : 'Send'}</span>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>

            </div>

        </aside >

    );

};

 

export default ChatPanel;