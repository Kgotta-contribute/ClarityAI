
import React from 'react';

 

export interface ChatMessage {

    id: string;

    role: 'user' | 'bot';

    content: string;

}

 

export interface ChatSession {

    id: string;

    name: string;

    messages: ChatMessage[];

    scope: string[];

}

 

export interface TranscriptOption {

    id: string;

    name: string;

    content?: string;

    jobID?: string;

    fileID?: string;

    fileName?: string;

    sizeBytes?: number;

    fileStatus?: string;

    userName?: string;

    domainID?: string;

    businessGroup?: string;

    status?: string;

    receivedAt?: string;

    sourceFileName?: string;

}

 

export interface PromptAction {

    text: string;

    icon: string;

    id: string;

}

 

export interface ChatPanelProps {

    transcripts?: TranscriptOption[];

    sessions?: ChatSession[];

    setSessions?: React.Dispatch<React.SetStateAction<ChatSession[]>>;

    activeSessionId?: string;

    setActiveSessionId?: React.Dispatch<React.SetStateAction<string>>;

}

 

// Constants

export const PROMPT_ACTIONS: PromptAction[] = [

    { text: 'Summarize', icon: '📋', id: 'summarize' },

    { text: 'Key issues', icon: '🔍', id: 'key-issues' },

    { text: 'Next steps', icon: '➡️', id: 'next-steps' },

    { text: 'Draft call notes', icon: '📞', id: 'draft-notes' }

];

 

export const CONDITIONAL_ACTIONS: PromptAction[] = [

    { text: 'Compare the transcripts', icon: '🔄', id: 'compare-transcripts' }

];

 

 

 