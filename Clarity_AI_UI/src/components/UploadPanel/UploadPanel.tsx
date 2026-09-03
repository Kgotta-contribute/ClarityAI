 

import React, { useState, useEffect, useRef } from 'react';

import { styles } from './UploadPanelStyles';

import { UploadService } from '../../services/UploadService';

import type { FileStatusResponse } from '../../services/apiService';

import { useTheme } from '../../hooks/useTheme';

import { showToast } from '../Toast/ToastContainer';

 

const STATUS_COLORS = {

    completed: '#4caf50',

    processing: '#2196f3',

    error: '#f44336',

    Failed: '#f44336',

    uploading: '#4a90d9',

    streaming: '#4a90d9',

    success: '#4caf50',

    idle: '#cdcdcd'

};

 

const FALLBACK_STATUS_TEXT = {

    uploading: 'Uploading'

};

 

// Special Messages

const SPECIAL_MESSAGES = {

    TRANSCRIPTION_STOPPED: '🛑 Transcription stopped successfully',

    TRANSCRIPTION_STOPPED_BY_USER: 'Transcription stopped by user',

    NO_FILE_SELECTED: 'No file selected',

    UPLOAD_SUCCESS: 'Upload successful!',

    UPLOAD_FAILED: 'Upload failed',

    DROP_SINGLE_FILE: 'Drop or select one audio file',

    DROP_MULTIPLE_FILES: 'Drop or select up to 5 files',

    FILE_SELECTED_SINGLE: '📄 1 File Selected',

    FILES_SELECTED_MULTIPLE: '📁 {count} Files Selected',

    MB_TOTAL: 'MB total',

};

 

interface UploadPanelProps {

    uploadState?: {

        selectedFiles: File[];

        fileStatuses: { [fileName: string]: any };

        currentJobId: string | null;

        uploadStatus: 'idle' | 'uploading' | 'success' | 'error';

        streamStatus: 'idle' | 'streaming' | 'completed' | 'error';

    };

    setUploadState?: React.Dispatch<React.SetStateAction<{

        selectedFiles: File[];

        fileStatuses: { [fileName: string]: any };

        currentJobId: string | null;

        uploadStatus: 'idle' | 'uploading' | 'success' | 'error';

        streamStatus: 'idle' | 'streaming' | 'completed' | 'error';

    }>>;
}

export interface LanguageOption {
    code: string;
    label: string;
    nativeName: string;
    group: string;
    flag: string;
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
    { code: 'auto', label: 'Auto-Detect Language', nativeName: 'Automatic Detection', group: '🌐 Automatic', flag: '🌐' },
    
    // Global & European Languages
    { code: 'en', label: 'English', nativeName: 'English (US/UK/Global)', group: '🌍 Global & European Languages', flag: '🇺🇸' },
    { code: 'es', label: 'Spanish', nativeName: 'Español', group: '🌍 Global & European Languages', flag: '🇪🇸' },
    { code: 'fr', label: 'French', nativeName: 'Français', group: '🌍 Global & European Languages', flag: '🇫🇷' },
    { code: 'de', label: 'German', nativeName: 'Deutsch', group: '🌍 Global & European Languages', flag: '🇩🇪' },
    { code: 'it', label: 'Italian', nativeName: 'Italiano', group: '🌍 Global & European Languages', flag: '🇮🇹' },
    { code: 'pt', label: 'Portuguese', nativeName: 'Português', group: '🌍 Global & European Languages', flag: '🇵🇹' },
    { code: 'ru', label: 'Russian', nativeName: 'Русский', group: '🌍 Global & European Languages', flag: '🇷🇺' },
    { code: 'uk', label: 'Ukrainian', nativeName: 'Українська', group: '🌍 Global & European Languages', flag: '🇺🇦' },
    { code: 'pl', label: 'Polish', nativeName: 'Polski', group: '🌍 Global & European Languages', flag: '🇵🇱' },
    { code: 'nl', label: 'Dutch', nativeName: 'Nederlands', group: '🌍 Global & European Languages', flag: '🇳🇱' },
    { code: 'sv', label: 'Swedish', nativeName: 'Svenska', group: '🌍 Global & European Languages', flag: '🇸🇪' },
    { code: 'no', label: 'Norwegian', nativeName: 'Norsk', group: '🌍 Global & European Languages', flag: '🇳🇴' },
    { code: 'da', label: 'Danish', nativeName: 'Dansk', group: '🌍 Global & European Languages', flag: '🇩🇰' },
    { code: 'fi', label: 'Finnish', nativeName: 'Suomi', group: '🌍 Global & European Languages', flag: '🇫🇮' },
    { code: 'el', label: 'Greek', nativeName: 'Ελληνικά', group: '🌍 Global & European Languages', flag: '🇬🇷' },
    { code: 'tr', label: 'Turkish', nativeName: 'Türkçe', group: '🌍 Global & European Languages', flag: '🇹🇷' },
    { code: 'ro', label: 'Romanian', nativeName: 'Română', group: '🌍 Global & European Languages', flag: '🇷🇴' },
    { code: 'hu', label: 'Hungarian', nativeName: 'Magyar', group: '🌍 Global & European Languages', flag: '🇭🇺' },
    { code: 'cs', label: 'Czech', nativeName: 'Čeština', group: '🌍 Global & European Languages', flag: '🇨🇿' },

    // Indic / South Asian Languages
    { code: 'kn', label: 'Kannada', nativeName: 'ಕನ್ನಡ', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'hi', label: 'Hindi', nativeName: 'हिन्दी', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'ta', label: 'Tamil', nativeName: 'தமிழ்', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'te', label: 'Telugu', nativeName: 'తెలుగు', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'ml', label: 'Malayalam', nativeName: 'മലയാളം', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'mr', label: 'Marathi', nativeName: 'मराठी', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'bn', label: 'Bengali', nativeName: 'বাংলা', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'gu', label: 'Gujarati', nativeName: 'ગુજરાતી', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'pa', label: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'ur', label: 'Urdu', nativeName: 'اردو', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'or', label: 'Odia', nativeName: 'ଓଡ଼ିଆ', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'as', label: 'Assamese', nativeName: 'অসমীয়া', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },
    { code: 'ne', label: 'Nepali', nativeName: 'नेपाली', group: '🇮🇳 Indic / South Asian Languages', flag: '🇳🇵' },
    { code: 'si', label: 'Sinhala', nativeName: 'සිංಹල', group: '🇮🇳 Indic / South Asian Languages', flag: '🇱🇰' },
    { code: 'sa', label: 'Sanskrit', nativeName: 'संस्कृतम्', group: '🇮🇳 Indic / South Asian Languages', flag: '🇮🇳' },

    // East & Southeast Asia
    { code: 'zh', label: 'Chinese (Mandarin)', nativeName: '中文 (普通话)', group: '🌏 East & Southeast Asian Languages', flag: '🇨🇳' },
    { code: 'ja', label: 'Japanese', nativeName: '日本語', group: '🌏 East & Southeast Asian Languages', flag: '🇯🇵' },
    { code: 'ko', label: 'Korean', nativeName: '한국어', group: '🌏 East & Southeast Asian Languages', flag: '🇰🇷' },
    { code: 'vi', label: 'Vietnamese', nativeName: 'Tiếng Việt', group: '🌏 East & Southeast Asian Languages', flag: '🇻🇳' },
    { code: 'id', label: 'Indonesian', nativeName: 'Bahasa Indonesia', group: '🌏 East & Southeast Asian Languages', flag: '🇮🇩' },
    { code: 'ms', label: 'Malay', nativeName: 'Bahasa Melayu', group: '🌏 East & Southeast Asian Languages', flag: '🇲🇾' },
    { code: 'th', label: 'Thai', nativeName: 'ไทย', group: '🌏 East & Southeast Asian Languages', flag: '🇹🇭' },
    { code: 'tl', label: 'Tagalog / Filipino', nativeName: 'Tagalog', group: '🌏 East & Southeast Asian Languages', flag: '🇵🇭' },

    // Middle Eastern & African
    { code: 'ar', label: 'Arabic', nativeName: 'العربية', group: '🕌 Middle Eastern & African Languages', flag: '🇸🇦' },
    { code: 'fa', label: 'Persian / Farsi', nativeName: 'فارسی', group: '🕌 Middle Eastern & African Languages', flag: '🇮🇷' },
    { code: 'he', label: 'Hebrew', nativeName: 'עברית', group: '🕌 Middle Eastern & African Languages', flag: '🇮🇱' },
    { code: 'sw', label: 'Swahili', nativeName: 'Kiswahili', group: '🕌 Middle Eastern & African Languages', flag: '🇰🇪' },
    { code: 'af', label: 'Afrikaans', nativeName: 'Afrikaans', group: '🕌 Middle Eastern & African Languages', flag: '🇿🇦' },
    { code: 'am', label: 'Amharic', nativeName: 'አማርኛ', group: '🕌 Middle Eastern & African Languages', flag: '🇪🇹' },
];

const UploadPanel: React.FC<UploadPanelProps> = ({ uploadState, setUploadState }) => {

    const [mode, setMode] = useState<'single' | 'multi'>('single');
    const [selectedLanguage, setSelectedLanguage] = useState<string>('auto');

    const checkboxOptions = {

        liveTranscription: false,

        redact: false

    };

 

    const { theme } = useTheme();

 

    // Create theme-aware styles

    const getThemeStyle = (styleName: string) => {

        const baseStyle = styles[styleName] || {};

 

        switch (styleName) {

            case 'panel':

                return {

                    ...baseStyle,

                    background: theme.colors.background,

                    border: `1px solid ${theme.colors.border}`,

                };

            case 'head':

                return {

                    ...baseStyle,

                    background: theme.colors.secondary,

                    color: theme.colors.text,

                    borderBottom: `1px solid ${theme.colors.border}`,

                };

            case 'body':

                return {

                    ...baseStyle,

                    background: theme.colors.background,

                };

            case 'input':

                return {

                    ...baseStyle,

                    background: theme.colors.surface,

                    color: theme.colors.text,

                    border: `1px solid ${theme.colors.border}`,

                };

            case 'fileMeta':

                return {

                    ...baseStyle,

                    color: theme.colors.textSecondary,

                };

            case 'subLabel':

                return {

                    ...baseStyle,

                    color: theme.colors.textSecondary,

                };

            case 'chip':

                return {

                    ...baseStyle,

                    background: theme.colors.surface,

                    color: theme.colors.text,

                    border: `1px solid ${theme.colors.border}`,

                };

            case 'uploader':

                return {

                    ...baseStyle,

                    border: `2px dashed ${isDragOver ? theme.colors.accent : theme.colors.border}`,

                    backgroundColor: isDragOver ? `${theme.colors.accent}10` : 'transparent',

                    cursor: 'pointer',

                    transition: 'all 0.2s ease',

                };

            case 'uploaderLabel':

                return {

                    ...baseStyle,

                    color: theme.colors.text,

                };

            case 'radioLabel':

                return {

                    ...baseStyle,

                    color: theme.colors.text,

                };

            case 'toggleLabel':

                return {

                    ...baseStyle,

                    color: theme.colors.text,

                };

            default:

                return baseStyle;

        }

    };

 

    const chips: string[] = [];

    const [fileMeta, setFileMeta] = useState(SPECIAL_MESSAGES.NO_FILE_SELECTED);

    const [localSelectedFiles, setLocalSelectedFiles] = useState<File[]>([]);

    const selectedFiles = uploadState?.selectedFiles || localSelectedFiles;

    const uploadStatus = uploadState?.uploadStatus || 'idle';

    const fileStatuses = uploadState?.fileStatuses || {};

    const setSelectedFiles = (files: File[]) => {

        setUploadState?.(prev => ({ ...prev, selectedFiles: files }));

        setLocalSelectedFiles(files);

    };

 

    const setCurrentJobId = (jobId: string | null) => {

        setUploadState?.(prev => ({ ...prev, currentJobId: jobId }));

    };

 

    const setUploadStatus = (status: 'idle' | 'uploading' | 'success' | 'error') => {

        setUploadState?.(prev => ({ ...prev, uploadStatus: status }));

    };

 

    const setStreamStatus = (status: 'idle' | 'streaming' | 'completed' | 'error') => {

        setUploadState?.(prev => ({ ...prev, streamStatus: status }));

    };

 

    const setFileStatuses = (statuses: any) => {

        setUploadState?.(prev => ({ ...prev, fileStatuses: statuses }));

    };

 

    const updateFileStatus = (fileName: string, updates: any) => {

        setUploadState?.(prev => {

            const newFileStatuses = {

                ...prev.fileStatuses,

                [fileName]: {

                    ...prev.fileStatuses[fileName],

                    ...updates

                }

            };

            return {

                ...prev,

                fileStatuses: newFileStatuses

            };

        });

    };

 

    const eventSourceRef = useRef<EventSource | null>(null);

    const [isDragOver, setIsDragOver] = useState(false);

    const [sizeError, setSizeError] = useState<string | null>(null);

    const [shakeUploader, setShakeUploader] = useState(false);

 

    const fileStatusesRef = useRef(fileStatuses);

    useEffect(() => {

        fileStatusesRef.current = fileStatuses;

    }, [fileStatuses]);

 

    // Start SSE streaming for status updates

    const startSSEStreaming = () => {

        if (eventSourceRef.current) {

            eventSourceRef.current.close();

        }

 

        // Get all files that need streaming using current state from ref

        const currentFileStatuses = fileStatusesRef.current;

        const processingFiles = Object.entries(currentFileStatuses).filter(([, status]) => {

            const shouldStream = status.jobId && status.fileId && status.streamStatus === 'streaming';

            return shouldStream;

        });

 

        if (processingFiles.length === 0) {

            return;

        }

 

        // Start SSE stream for the first job (assuming all files are in the same job)

        const firstFile = processingFiles[0][1];

        if (firstFile.jobId) {

            UploadService.getFileStatusStream(

                firstFile.jobId,

                '', // Empty fileId to get all files in the job

                (statusUpdate: FileStatusResponse | any) => {

                    // Handle the case where we get the full SSE response with files array

                    if (statusUpdate.files && Array.isArray(statusUpdate.files)) {

                        statusUpdate.files.forEach((file: FileStatusResponse) => {

                            processFileUpdate(file);

                        });

                        return;

                    }

                    processFileUpdate(statusUpdate);

                },

                (error: Error) => {

                    console.error('❌ SSE stream error:', error);

                },

                () => {

                    console.log('SSE stream completed');

                }

            ).catch(error => {

                console.error('❌ SSE stream setup failed:', error);

            });

        } else {

            console.error('❌ No jobId found for SSE streaming');

        }

    };

 

    const processFileUpdate = (fileUpdate: FileStatusResponse) => {

        // Find the corresponding file by fileID using current state from ref

        const currentFileStatuses = fileStatusesRef.current;

        const fileName = Object.keys(currentFileStatuses).find(name => {

            const match = currentFileStatuses[name].fileId === fileUpdate.fileID;

            return match;

        });

 

        if (fileName) {

            // Check if file was manually stopped by user - don't override stopped status

            const currentStatus = currentFileStatuses[fileName];

            if (currentStatus?.apiStatus?.errorDetails === SPECIAL_MESSAGES.TRANSCRIPTION_STOPPED_BY_USER) {

                // File was manually stopped, don't update with SSE data

                return;

            }

 

            // Update file status with SSE response

            updateFileStatus(fileName, {

                apiStatus: fileUpdate,

                streamStatus: fileUpdate.status === 'completed' ? 'completed' :

                    (fileUpdate.status === 'error' || fileUpdate.status === 'Failed') ? 'error' : 'streaming'

            });

 

            // File status updated - component will re-render automatically

 

            // Check if all files are completed or failed (no longer processing)

            const allCompleted = Object.values(currentFileStatuses).every(status =>

                status.apiStatus?.status === 'completed' ||

                status.apiStatus?.status === 'error' ||

                status.apiStatus?.status === 'Failed' ||

                status.streamStatus === 'completed' ||

                status.streamStatus === 'error'

            );

 

            if (allCompleted) {

                stopStreaming();

            }

        }

    };

 

    // Stop streaming

    const stopStreaming = () => {

        if (eventSourceRef.current) {

            eventSourceRef.current.close();

            eventSourceRef.current = null;

        }

    };

 

    useEffect(() => {

        return () => {

            stopStreaming();

        };

    }, []);

 

    const initializeFileStatuses = (files: File[]) => {

        const newStatuses: typeof fileStatuses = {};

        files.forEach(file => {

            newStatuses[file.name] = {

                uploadStatus: 'idle',

                streamStatus: 'idle',

                progress: 0,

                streamProgress: { percentage: 0 },

                transcriptContent: ''

            };

        });

        setFileStatuses(newStatuses);

    };

 

    const handleDownloadFile = async (fileName: string) => {

        const fileStatus = fileStatuses[fileName];

        if (!fileStatus?.jobId || !fileStatus?.fileId) {

            const errorMsg = 'Missing jobId or fileId for download';

            console.error(errorMsg);

            showToast(errorMsg, 'error');

            return;

        }

 

        try {

            const transcriptResponse = await UploadService.downloadTranscript(fileStatus.jobId, fileStatus.fileId);

            const xMessage = transcriptResponse.headers.get('X-Message');

 

            if (xMessage) {

                showToast(xMessage, 'warning', 5000);

            }

            // Check if response is ok

            if (!transcriptResponse.ok) {

                const errorText = await transcriptResponse.text();

                console.log('Diarized API Error Response:', errorText);

                console.log('Diarized Response Status:', transcriptResponse.status, transcriptResponse.statusText);

 

                // Try to parse JSON error response

                let errorDetail = errorText;

                try {

                    const errorJson = JSON.parse(errorText);

                    console.log('Diarized Parsed Error JSON:', errorJson);

                    if (errorJson.detail) {

                        errorDetail = errorJson.detail;

                        console.log('Diarized using detail field:', errorDetail);

                    } else if (errorJson.message) {

                        errorDetail = errorJson.message;

                        console.log('Diarized using message field:', errorDetail);

                    } else if (errorJson.error) {

                        errorDetail = errorJson.error;

                        console.log('Diarized using error field:', errorDetail);

                    }

                } catch (parseError) {

                    console.log('Diarized JSON parsing failed, using raw text:', errorText);

                    // If JSON parsing fails, use the raw error text

                    errorDetail = errorText || `${transcriptResponse.status} ${transcriptResponse.statusText}`;

                }

 

                console.log('Diarized final error detail to throw:', errorDetail);

                throw new Error(errorDetail);

            }

 

            const blob = await transcriptResponse.blob();

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');

            a.href = url;

            a.download = `transcript_diarized_${fileName.replace(/\.[^/.]+$/, "")}.txt`;

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);

 

        } catch (error) {

            console.error('Diarized download failed:', error);

 

            let errorMessage = 'Unknown error occurred during download';

 

            if (error instanceof Error) {

                // Use the detailed error message that includes API response

                errorMessage = error.message;

                console.log('Error message being shown in toast:', errorMessage);

            }

 

            showToast(errorMessage, 'error', 7000);

        }

    };

 

    const handleDownloadRawFile = async (fileName: string) => {

        const fileStatus = fileStatuses[fileName];

        if (!fileStatus?.jobId || !fileStatus?.fileId) {

            const errorMsg = 'Missing jobId or fileId for download';

            console.error(errorMsg);

            showToast(errorMsg, 'error');

            return;

        }

 

        try {

            const transcriptResponse = await UploadService.downloadRawTranscript(fileStatus.jobId, fileStatus.fileId);

            const xMessage = transcriptResponse.headers.get('X-Message');

 

            // Show warning toast if X-Message header is present

            if (xMessage) {

                showToast(xMessage, 'warning', 5000);

            }

            // Check if response is ok

            if (!transcriptResponse.ok) {

                const errorText = await transcriptResponse.text();

 

                // Try to parse JSON error response

                let errorDetail = errorText;

                try {

                    const errorJson = JSON.parse(errorText);

                    if (errorJson.detail) {

                        errorDetail = errorJson.detail;

                    } else if (errorJson.message) {

                        errorDetail = errorJson.message;

                    } else if (errorJson.error) {

                        errorDetail = errorJson.error;

                    }

                } catch (parseError) {

                    // If JSON parsing fails, use the raw error text

                    errorDetail = errorText || `${transcriptResponse.status} ${transcriptResponse.statusText}`;

                }

 

                throw new Error(errorDetail);

            }

 

            const blob = await transcriptResponse.blob();

            const url = window.URL.createObjectURL(blob);

            const a = document.createElement('a');

            a.href = url;

            a.download = `transcript_raw_${fileName.replace(/\.[^/.]+$/, "")}.txt`;

            document.body.appendChild(a);

            a.click();

            document.body.removeChild(a);

            window.URL.revokeObjectURL(url);

 

            // Show success toast

        } catch (error) {

            console.error('Raw download failed:', error);

 

            // Extract detailed error message from API response

            let errorMessage = 'Unknown error occurred during download';

 

            if (error instanceof Error) {

                // Use the detailed error message that includes API response

                errorMessage = error.message;

            }

 

            showToast(errorMessage, 'error', 7000);

        }

    };

 

    const handleRemoveFile = (fileToRemove: File) => {

        const updatedFiles = selectedFiles.filter(file =>

            file.name !== fileToRemove.name || file.size !== fileToRemove.size

        );

 

        setSelectedFiles(updatedFiles);

 

        // Clean up file status for removed file

        const updatedStatuses = { ...fileStatuses };

        delete updatedStatuses[fileToRemove.name];

        setFileStatuses(updatedStatuses);

 

        // Update fileMeta display

        if (updatedFiles.length === 0) {

            setFileMeta(SPECIAL_MESSAGES.NO_FILE_SELECTED);

        } else if (mode === 'multi') {

            const fileNames = updatedFiles

                .map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`)

                .join(', ');

            setFileMeta(`${updatedFiles.length} file(s): ${fileNames}`);

        } else {

            const file = updatedFiles[0];

            setFileMeta(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

        }

    };

 

    const handleStopIndividualFile = async (fileName: string) => {

        const fileStatus = fileStatuses[fileName];

        if (!fileStatus?.jobId || !fileStatus?.fileId) {

            console.error('Missing jobId or fileId for cancellation');

            return;

        }

 

        try {

            // Call the cancel API for this specific file

            await UploadService.cancelJob(fileStatus.jobId, fileStatus.fileId);

 

            // Update the file status to cancelled

            updateFileStatus(fileName, {

                streamStatus: 'error',

                uploadStatus: 'error',

                apiStatus: {

                    ...fileStatus.apiStatus,

                    status: 'error',

                    errorDetails: SPECIAL_MESSAGES.TRANSCRIPTION_STOPPED_BY_USER

                }

            });

        } catch (error) {

            console.error(`❌ Failed to stop transcription for ${fileName}:`, error);

            // Still update UI to show user attempted to stop

            updateFileStatus(fileName, {

                apiStatus: {

                    ...fileStatus.apiStatus,

                    errorDetails: 'Stop request failed, but transcription may still be cancelled'

                }

            });

        }

    };

 

    const handleStartTranscription = async () => {

        if (selectedFiles.length === 0) {

            return;

        }

 

        try {

            // Step 1: Create job for ALL selected files

            const fileNames = selectedFiles.map(file => file.name);
            console.log(`🌐 [Upload] Selected Language: "${selectedLanguage}" | Options:`, { language: selectedLanguage, redact: checkboxOptions.redact, files: fileNames });

            setUploadStatus('uploading');

            const jobData = await UploadService.createJob(fileNames, {

                redactPHIPII: checkboxOptions.redact,

                liveTranscription: checkboxOptions.liveTranscription,

                Keywords: chips,

                language: selectedLanguage

            });

            const jobId = jobData.jobID;

            const fileIds = jobData.fileID; // This should be an object with file IDs

 

            if (!jobId) {

                throw new Error('No jobId returned from create endpoint');

            }

 

            setCurrentJobId(jobId);

 

            // Create upload promises for all files at once

            const uploadPromises = selectedFiles.map((file, i) => {

                // Try different ways to access the fileId

                const fileIdString = fileIds[i.toString()];

                const fileIdNumber = fileIds[i];

                const fileIdDirect = fileIds[file.name];

                const fileId = fileIdString || fileIdNumber || fileIdDirect;

 

                if (!fileId) {

                    updateFileStatus(file.name, { uploadStatus: 'error', streamStatus: 'error' });

                    return Promise.resolve(); // Return resolved promise to not break Promise.all

                }

 

                return (async () => {

                    try {

                        // Set initial status with jobId and fileId (REQUIRED for SSE)

                        updateFileStatus(file.name, { jobId, fileId, uploadStatus: 'uploading', progress: 0 });

 

                        // Upload this file

                        const uploadResponse = await UploadService.uploadFile(jobId, fileId, file);

                        updateFileStatus(file.name, { uploadStatus: uploadResponse.uploadStatus, progress: 100 });

 

                        // Set streaming status for SSE to work

                        updateFileStatus(file.name, { streamStatus: 'streaming' });

                    } catch (fileError) {

                        console.error(`Upload failed for ${file.name}:`, fileError);

 

                        // Extract error message and show in toast

                        let errorMessage = 'Upload failed';

                        if (fileError instanceof Error) {

                            errorMessage = fileError.message;

                        }

 

                        showToast(`${file.name}: ${errorMessage}`, 'error', 7000);

                        updateFileStatus(file.name, { uploadStatus: 'error', streamStatus: 'error' });

                    }

 

                })();

            });

 

            // Execute all uploads in parallel

            await Promise.all(uploadPromises);

 

            // Start SSE streaming for real-time status updates (with small delay to ensure state is updated)

            setTimeout(() => {

                startSSEStreaming();

            }, 100);

 

            // Update global status

            setUploadStatus('success');

            setStreamStatus('streaming');

 

        } catch (error) {

            console.error('Upload process failed:', error);

            // Extract error message and show in toast

            let errorMessage = 'Upload process failed';

            if (error instanceof Error) {

                errorMessage = error.message;

            }

 

            showToast(errorMessage, 'error', 7000);

            setUploadStatus('error');

            setStreamStatus('error');

        }

    };

 

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {

        const files = e.target.files;

        if (!files || files.length === 0) return;

 

        processFiles(Array.from(files));

        e.target.value = '';

 

    };

 

    const processFiles = (files: File[]) => {

        setUploadStatus('idle');

        setSizeError(null);

        setShakeUploader(false);

        // Define maximum file size (25MB in bytes)

        const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB

 

        // First filter for supported file types

        const supportedFiles = files.filter(file => {

            const extension = file.name.toLowerCase().split('.').pop();

            return ['mp3', 'mp4', 'wav'].includes(extension || '');

        });

 

        // Check supported files first

        if (supportedFiles.length === 0) {

            alert('Please select valid audio files (.mp3, .mp4, .wav)');

            return;

        }

 

        const oversizedFiles = supportedFiles.filter(file => file.size > MAX_FILE_SIZE);

        const validFiles = supportedFiles.filter(file => file.size <= MAX_FILE_SIZE);

 

        // Show warnings for oversized files

        if (oversizedFiles.length > 0) {

            const fileListText = oversizedFiles.map(f => `"${f.name}" (${(f.size / 1024 / 1024).toFixed(2)} MB)`).join(', ');

            const errorMsg = `Upload failed: File size must be less than 25 MB. Oversized files: ${fileListText}`;

            setSizeError(errorMsg);

            setShakeUploader(true);

            showToast(errorMsg, 'error', 7000);

            // Reset shake animation after 500ms so it can be re-triggered

            setTimeout(() => {

                setShakeUploader(false);

            }, 500);

        }

 

        // If no valid files remain after size filtering, return early

        if (validFiles.length === 0) {

            return;

        }

 

        // Process only valid files (use validFiles, not supportedFiles)

        if (mode === 'multi') {

            // Check if more than 5 files are selected - reject the selection

            if (validFiles.length > 5) {

                showToast(

                    `You can only select up to 5 files. You selected ${validFiles.length} files. Please select 5 or fewer files.`,

                    'error',

                    5000

                );

                return; // Don't process any files

            }

 

            const fileCount = validFiles.length;

            const selectedFilesArray = validFiles;

            const fileNames = selectedFilesArray

                .map(f => `${f.name} (${(f.size / 1024 / 1024).toFixed(2)} MB)`)

                .join(', ');

            setFileMeta(`${fileCount} file(s): ${fileNames}`);

            setSelectedFiles(selectedFilesArray);

            initializeFileStatuses(selectedFilesArray);

        } else {

            const file = validFiles[0];

            setFileMeta(`${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

            setSelectedFiles([file]);

            initializeFileStatuses([file]);

        }

    };

 

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {

        e.preventDefault();

        e.stopPropagation();

        setIsDragOver(true);

    };

 

    const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {

        e.preventDefault();

        e.stopPropagation();

        setIsDragOver(false);

    };

 

    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {

        e.preventDefault();

        e.stopPropagation();

        setIsDragOver(false);

 

        const files = Array.from(e.dataTransfer.files);

        processFiles(files);

    };

 

    const handleUploaderClick = () => {

        const fileInput = document.getElementById('file') as HTMLInputElement;

        if (fileInput) {

            fileInput.click();

        }

    };

 

    return (

        <div style={{ width: '100%', display: 'flex', flexDirection: 'column' }}>

            <style>

                {`

                    @keyframes uploaderShake {

                        0%, 100% { transform: translateX(0); }

                        20%, 60% { transform: translateX(-6px); }

                        40%, 80% { transform: translateX(6px); }

                    }

                    @keyframes pulseRedGlow {

                        0% { box-shadow: 0 0 5px rgba(244, 67, 54, 0.4); border-color: #f44336; }

                        50% { box-shadow: 0 0 20px rgba(244, 67, 54, 0.8); border-color: #ff6659; }

                        100% { box-shadow: 0 0 5px rgba(244, 67, 54, 0.4); border-color: #f44336; }

                    }

                    @keyframes futuristicSlideIn {

                        from { opacity: 0; transform: translateY(-10px); }

                        to { opacity: 1; transform: translateY(0); }

                    }

                    .uploader-shake {

                        animation: uploaderShake 0.4s ease-in-out;

                    }

                    .uploader-error-glow {

                        animation: pulseRedGlow 1.5s infinite ease-in-out !important;

                    }

                    .futuristic-glass-alert {

                        background: rgba(244, 67, 54, 0.08);

                        backdrop-filter: blur(12px);

                        -webkit-backdrop-filter: blur(12px);

                        border: 1px solid rgba(244, 67, 54, 0.25);

                        border-radius: 8px;

                        padding: 12px 16px;

                        margin-top: 12px;

                        display: flex;

                        align-items: center;

                        gap: 12px;

                        color: #ff9d94;

                        font-size: 13px;

                        box-shadow: 0 8px 32px 0 rgba(244, 67, 54, 0.1);

                        animation: futuristicSlideIn 0.3s cubic-bezier(0.16, 1, 0.3, 1);

                    }

                `}

            </style>

            <div style={{ ...getThemeStyle('panel') }}>

                <div style={getThemeStyle('head')}>Upload & Run Options</div>

                <div style={getThemeStyle('body')}>

                    <div style={styles.row} role="radiogroup" aria-label="Upload mode">

                        <label style={getThemeStyle('radioLabel')}>

                            <input

                                type="radio"

                                name="mode"

                                checked={mode === 'single'}

                                onChange={() => setMode('single')}

                            />

                            Single File Mode

                        </label>

                        <label style={getThemeStyle('radioLabel')}>

                            <input

                                type="radio"

                                name="mode"

                                checked={mode === 'multi'}

                                onChange={() => setMode('multi')}

                            />

                            Multiple Files (max 5)

                        </label>

                    </div>

                    <div
                        className={`${shakeUploader ? 'uploader-shake' : ''} ${sizeError ? 'uploader-error-glow' : ''} ${isDragOver ? 'uploader-drag-over' : ''}`}
                        style={{
                            ...getThemeStyle('uploader'),
                            ...(isDragOver ? { borderColor: '#a855f7', background: 'rgba(139, 92, 246, 0.1)', boxShadow: '0 0 20px rgba(139, 92, 246, 0.3)' } : {})
                        }}
                        onDragOver={handleDragOver}
                        onDragLeave={handleDragLeave}
                        onDrop={handleDrop}
                        onClick={handleUploaderClick}
                    >
                        <input
                            id="file"
                            type="file"
                            accept=".mp3,.mp4,.wav"
                            multiple={mode === 'multi'}
                            onChange={handleFileChange}
                            style={{ display: 'none' }}
                        />

                        {/* Neon Purple Cloud Upload Icon matching Image 1 */}
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '8px' }}>
                            <svg width="54" height="54" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <defs>
                                    <filter id="cloudPurpleGlow" x="-20%" y="-20%" width="140%" height="140%">
                                        <feGaussianBlur stdDeviation="2.5" result="blur" />
                                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                                    </filter>
                                </defs>
                                <path
                                    d="M6.5 19C4.01472 19 2 16.9853 2 14.5C2 12.1564 3.79151 10.2313 6.07999 10.0243C6.54415 6.6433 9.44498 4 13 4C17.0863 4 20.4687 7.07005 20.9431 11.0537C21.0348 11.0381 21.129 11.03 21.2245 11.03C22.7574 11.03 24 12.2726 24 13.8055C24 15.3384 22.7574 16.581 21.2245 16.581H20.5"
                                    stroke="#a855f7"
                                    strokeWidth="2.2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#cloudPurpleGlow)"
                                />
                                <path
                                    d="M12 11V19M12 11L8.5 14.5M12 11L15.5 14.5"
                                    stroke="#c084fc"
                                    strokeWidth="2.4"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                    filter="url(#cloudPurpleGlow)"
                                />
                            </svg>
                        </div>

                        <div style={getThemeStyle('uploaderLabel')}>
                            <strong>{mode === 'single' ? SPECIAL_MESSAGES.DROP_SINGLE_FILE : SPECIAL_MESSAGES.DROP_MULTIPLE_FILES}</strong>
                            <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '6px', fontWeight: 400 }}>
                                Supported formats: .mp3, .mp4, .wav (Max size per file: 25 MB)
                            </div>
                        </div>

                        {/* Browse Files Button matching Image 1 */}
                        <button
                            type="button"
                            onClick={(e) => {
                                e.stopPropagation();
                                handleUploaderClick();
                            }}
                            style={{
                                marginTop: '16px',
                                background: 'linear-gradient(135deg, #7c3aed 0%, #3b82f6 100%)',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '10px',
                                padding: '10px 28px',
                                fontSize: '14px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                boxShadow: '0 4px 16px rgba(124, 58, 237, 0.4)',
                                transition: 'all 0.2s ease',
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '8px'
                            }}
                            onMouseEnter={(e) => {
                                e.currentTarget.style.transform = 'translateY(-1px)';
                                e.currentTarget.style.boxShadow = '0 6px 20px rgba(124, 58, 237, 0.55)';
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.transform = 'translateY(0)';
                                e.currentTarget.style.boxShadow = '0 4px 16px rgba(124, 58, 237, 0.4)';
                            }}
                        >
                            Browse Files
                        </button>

                        <div style={getThemeStyle('fileMeta')}>{fileMeta}</div>

                        {uploadStatus === 'uploading' && <div style={{ color: STATUS_COLORS.uploading, marginTop: 8 }}>{FALLBACK_STATUS_TEXT.uploading}...</div>}
                        {uploadStatus === 'success' && <div style={{ color: STATUS_COLORS.success, marginTop: 8 }}>{SPECIAL_MESSAGES.UPLOAD_SUCCESS}</div>}
                        {uploadStatus === 'error' && <div style={{ color: STATUS_COLORS.error, marginTop: 8 }}>{SPECIAL_MESSAGES.UPLOAD_FAILED}</div>}
                    </div>

                    {sizeError && (

                        <div className="futuristic-glass-alert">

                            <span style={{ fontSize: '18px' }}>⚠️</span>

                            <div style={{ flex: 1 }}>

                                <strong style={{ display: 'block', marginBottom: '2px', color: '#ff4d4d' }}>File Size Constraint</strong>

                                {sizeError}

                            </div>

                            <button

                                onClick={(e) => {

                                    e.stopPropagation();

                                    setSizeError(null);

                                }}

                                style={{

                                    background: 'none',

                                    border: 'none',

                                    color: '#ff9d94',

                                    cursor: 'pointer',

                                    fontSize: '16px',

                                    padding: '4px',

                                    opacity: 0.7,

                                    transition: 'opacity 0.2s'

                                }}

                                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}

                                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.7'}

                            >

                                ✕

                            </button>

                        </div>

                    )}

                </div>

 

                <div style={styles.chips}>

                    {chips.map((chip, i) => (

                        <span key={i} style={getThemeStyle('chip')}>{chip}</span>

                    ))}

                </div>

                {/* Spoken Audio Language Selector */}
                <div style={{
                    margin: '16px 24px 0 12px',
                    padding: '14px 16px',
                    borderRadius: '10px',
                    background: theme.colors.surface,
                    border: `1px solid ${theme.colors.border}`,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '6px' }}>
                        <label style={{ fontSize: '13px', fontWeight: 600, color: theme.colors.text, display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span>Audio Spoken Language</span>
                            <span style={{ fontSize: '11px', color: '#a855f7', background: 'rgba(168, 85, 247, 0.1)', padding: '2px 8px', borderRadius: '12px', border: '1px solid rgba(168, 85, 247, 0.2)', fontWeight: 500 }}>
                                90+ Languages
                            </span>
                        </label>
                        <span style={{ fontSize: '12px', color: '#a855f7', fontWeight: 500 }}>
                            Select your language for better transcription quality
                        </span>
                    </div>

                    <select
                        value={selectedLanguage}
                        onChange={(e) => setSelectedLanguage(e.target.value)}
                        style={{
                            width: '100%',
                            padding: '10px 14px',
                            borderRadius: '8px',
                            background: theme.colors.background,
                            color: theme.colors.text,
                            border: `1px solid ${theme.colors.border}`,
                            fontSize: '13px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            outline: 'none'
                        }}
                    >
                        {Array.from(new Set(SUPPORTED_LANGUAGES.map(l => l.group))).map(groupName => (
                            <optgroup key={groupName} label={groupName}>
                                {SUPPORTED_LANGUAGES.filter(l => l.group === groupName).map(opt => (
                                    <option key={opt.code} value={opt.code}>
                                        {opt.flag} {opt.label} ({opt.nativeName}) - [{opt.code}]
                                    </option>
                                ))}
                            </optgroup>
                        ))}
                    </select>
                    <div style={{ fontSize: '12px', color: '#94a3b8', display: 'flex', alignItems: 'center', gap: '6px', marginTop: '4px' }}>
                        <span>💡</span>
                        <span>Select your audio's spoken language for 100% native script accuracy, or leave as Auto-Detect.</span>
                    </div>
                </div>

                {/* Action Buttons */}

                <div style={{

                    ...styles.toolbar,

                    margin: '24px 24px 24px 12px',

                    paddingTop: 12,

                    paddingBottom: 8

                }}>

                    <div style={{

                        ...styles.row,

                        justifyContent: 'flex-start', // Align button to left instead of stretching

                        width: '100%',

                        gap: '12px' // Add gap between buttons

                    }}>

                        <button

                            style={{

                                ...styles.btn,

                                backgroundColor: selectedFiles.length > 0 ? '#4a90d9' : '#666',

                                fontSize: '14px',

                                fontWeight: 'bold',

                                padding: '12px 20px',

                                border: selectedFiles.length > 0 ? '2px solid #4a90d9' : '2px solid #666',

                                boxShadow: selectedFiles.length > 0 ? '0 0 10px rgba(74, 144, 217, 0.3)' : 'none',

                                borderRadius: 6, // Slightly more rounded corners

                                transition: 'all 0.2s ease', // Smooth hover transitions

                                maxWidth: 'fit-content', // Prevent button from stretching

                                whiteSpace: 'nowrap' // Prevent text wrapping

                            }}

                            onClick={handleStartTranscription}

                            disabled={selectedFiles.length === 0}

                            onMouseEnter={(e) => {

                                if (selectedFiles.length > 0) {

                                    e.currentTarget.style.transform = 'translateY(-1px)';

                                    e.currentTarget.style.boxShadow = '0 4px 15px rgba(74, 144, 217, 0.4)';

                                }

                            }}

                            onMouseLeave={(e) => {

                                if (selectedFiles.length > 0) {

                                    e.currentTarget.style.transform = 'translateY(0px)';

                                    e.currentTarget.style.boxShadow = '0 0 10px rgba(74, 144, 217, 0.3)';

                                }

                            }}

                        >

                            🚀 Start Transcription ({selectedFiles.length} files)

                        </button>

                    </div>

                </div>

            </div>

 

            {/* File Upload Status & Progress */}

            {selectedFiles.length > 0 && (

                <div style={{ marginTop: 16, padding: 16, backgroundColor: theme.colors.surface, borderRadius: 8, border: `1px solid ${theme.colors.border}` }}>

                    <div style={{ marginBottom: 12 }}>

                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>

                            <span style={{ color: theme.colors.text, fontSize: 14, fontWeight: 'bold' }}>

                                {selectedFiles.length === 1 ? SPECIAL_MESSAGES.FILE_SELECTED_SINGLE : SPECIAL_MESSAGES.FILES_SELECTED_MULTIPLE.replace('{count}', selectedFiles.length.toString())}

                            </span>

                            <span style={{ color: theme.colors.textSecondary, fontSize: 12 }}>

                                {(selectedFiles.reduce((total, file) => total + file.size, 0) / 1024 / 1024).toFixed(2)} {SPECIAL_MESSAGES.MB_TOTAL}

                            </span>

                        </div>

 

                        <div style={{ marginBottom: 8 }}>

                            {selectedFiles.map((file, index) => {

                                const fileStatus = fileStatuses[file.name];

                                const getStatusText = () => {

                                    if (fileStatus?.apiStatus) {

                                        const api = fileStatus.apiStatus;

                                        if (api.errorDetails === SPECIAL_MESSAGES.TRANSCRIPTION_STOPPED_BY_USER) {

                                            return SPECIAL_MESSAGES.TRANSCRIPTION_STOPPED;

                                        }

                                        return `${api.status}`;

                                    }

                                };

 

                                const getCurrentProgress = () => {

                                    const apiPercentage = fileStatus?.apiStatus?.progress?.percentage;

                                    const streamPercentage = fileStatus?.streamProgress?.percentage;

                                    const uploadProgress = fileStatus?.progress || 0;

 

                                    if (apiPercentage !== undefined) return Math.round(apiPercentage);

                                    if (streamPercentage !== undefined) return Math.round(streamPercentage);

 

                                    // Handle completion states

                                    if (fileStatus?.streamStatus === 'completed' || fileStatus?.uploadStatus === 'success') {

                                        return 100;

                                    }

 

                                    if (fileStatus?.uploadStatus === 'uploading') return uploadProgress;

 

                                    return 0;

                                };

 

                                return (

                                    <div key={`${file.name}-${file.size}-${index}`} style={{

                                        padding: '8px',

                                        backgroundColor: fileStatus ? theme.colors.surfaceHover : theme.colors.surface,

                                        borderRadius: 6,

                                        marginBottom: 6,

                                        border: fileStatus ? '1px solid #4a90d9' : `1px solid ${theme.colors.border}`,

                                        position: 'relative'

                                    }}>

                                        {/* Remove Button - only show if file is not processing */}

                                        {(!fileStatus || (

                                            fileStatus.uploadStatus === 'idle' &&

                                            fileStatus.streamStatus === 'idle' &&

                                            !fileStatus.apiStatus

                                        )) && (

                                                <button

                                                    onClick={() => handleRemoveFile(file)}

                                                    style={{

                                                        position: 'absolute',

                                                        top: 4,

                                                        right: 4,

                                                        width: 20,

                                                        height: 20,

                                                        backgroundColor: '#f44336',

                                                        color: 'white',

                                                        border: 'none',

                                                        borderRadius: '50%',

                                                        fontSize: 10,

                                                        cursor: 'pointer',

                                                        display: 'flex',

                                                        alignItems: 'center',

                                                        justifyContent: 'center',

                                                        transition: 'all 0.2s ease',

                                                        boxShadow: '0 2px 4px rgba(244, 67, 54, 0.3)',

                                                        zIndex: 1

                                                    }}

                                                    onMouseEnter={(e) => {

                                                        e.currentTarget.style.backgroundColor = '#d32f2f';

                                                        e.currentTarget.style.transform = 'scale(1.1)';

                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(244, 67, 54, 0.4)';

                                                    }}

                                                    onMouseLeave={(e) => {

                                                        e.currentTarget.style.backgroundColor = '#f44336';

                                                        e.currentTarget.style.transform = 'scale(1)';

                                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(244, 67, 54, 0.3)';

                                                    }}

                                                    title={`Remove ${file.name}`}

                                                >

                                                    ✕

                                                </button>

                                            )}

 

                                        {/* Stop Button - only show if file is processing */}

                                        {fileStatus && (

                                            fileStatus.uploadStatus === 'success' ||

                                            fileStatus.streamStatus === 'streaming' ||

                                            fileStatus.apiStatus?.status === 'processing'

                                        ) && fileStatus.apiStatus?.status !== 'completed' && (

                                                <button

                                                    onClick={() => handleStopIndividualFile(file.name)}

                                                    style={{

                                                        position: 'absolute',

                                                        top: 4,

                                                        right: 4,

                                                        width: 20,

                                                        height: 20,

                                                        backgroundColor: '#ff9800',

                                                        color: 'white',

                                                        border: 'none',

                                                        borderRadius: '50%',

                                                        fontSize: 10,

                                                        cursor: 'pointer',

                                                        display: 'flex',

                                                        alignItems: 'center',

                                                        justifyContent: 'center',

                                                        transition: 'all 0.2s ease',

                                                        boxShadow: '0 2px 4px rgba(255, 152, 0, 0.3)',

                                                        zIndex: 1

                                                    }}

                                                    onMouseEnter={(e) => {

                                                        e.currentTarget.style.backgroundColor = '#f57c00';

                                                        e.currentTarget.style.transform = 'scale(1.1)';

                                                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(255, 152, 0, 0.4)';

                                                    }}

                                                    onMouseLeave={(e) => {

                                                        e.currentTarget.style.backgroundColor = '#ff9800';

                                                        e.currentTarget.style.transform = 'scale(1)';

                                                        e.currentTarget.style.boxShadow = '0 2px 4px rgba(255, 152, 0, 0.3)';

                                                    }}

                                                    title={`Stop transcription for ${file.name}`}

                                                >

                                                    ■

                                                </button>

                                            )}

 

                                        {/* File Header */}

                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, paddingRight: 24 }}>

                                            <span style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>

                                                [{index + 1}] {file.name}

                                            </span>

                                            <span style={{ color: theme.colors.textSecondary, fontSize: 11 }}>

                                                {(file.size / 1024 / 1024).toFixed(2)} MB

                                            </span>

                                        </div>

                                        {fileStatus && (

                                            <>

                                                {(fileStatus.uploadStatus === 'success' ||

                                                    fileStatus.apiStatus?.status === 'Stopped' ||

                                                    fileStatus.apiStatus?.status === 'stopped' ||

                                                    fileStatus.streamStatus === 'error') && (

                                                        <div style={{ marginBottom: 6 }}>

                                                            <span style={{ color: 'white', fontSize: 12 }}>

                                                                Status: {getStatusText()}

                                                            </span>

                                                        </div>

                                                    )}

                                                <div style={{ marginBottom: 6, position: 'relative' }}>

                                                    <div style={{

                                                        width: '100%',

                                                        height: 20,

                                                        backgroundColor: theme.colors.surface,

                                                        border: `2px solid ${theme.colors.border}`, // Add border to make container more visible

                                                        borderRadius: 10,

                                                        overflow: 'hidden',

                                                        position: 'relative'

                                                    }}>

                                                        <div style={{

                                                            width: `${getCurrentProgress()}%`,

                                                            height: '100%',

                                                            backgroundColor: (() => {

                                                                if (fileStatus?.apiStatus?.status === 'completed') return '#4caf50'; // Green for completed

                                                                if (fileStatus?.apiStatus?.status === 'processing') return '#2196f3'; // Blue for processing

                                                                if (fileStatus?.apiStatus?.errorDetails) return '#f44336'; // Red for errors

                                                                return '#4caf50'; // Default green

                                                            })(),

                                                            transition: 'width 0.3s ease, background-color 0.3s ease',

                                                            borderRadius: 10

                                                        }} />

                                                        <div style={{

                                                            position: 'absolute',

                                                            top: '50%',

                                                            left: '50%',

                                                            transform: 'translate(-50%, -50%)',

                                                            color: getCurrentProgress() > 50 ? '#fff' : (() => {

                                                                if (fileStatus?.apiStatus?.status === 'completed') return '#4caf50';

                                                                if (fileStatus?.apiStatus?.status === 'processing') return '#2196f3';

                                                                if (fileStatus?.apiStatus?.errorDetails) return '#f44336';

                                                                return '#4caf50';

                                                            })(),

                                                            fontSize: 11,

                                                            fontWeight: 'bold',

                                                            textShadow: getCurrentProgress() > 50 ? '0 0 2px rgba(0,0,0,0.5)' : 'none'

                                                        }}>

                                                            {getCurrentProgress()}%

                                                        </div>

                                                    </div>

                                                </div>

                                                {fileStatus.apiStatus?.progress && (

                                                    <div style={{

                                                        display: 'flex',

                                                        justifyContent: 'space-between',

                                                        alignItems: 'center',

                                                        fontSize: 11,

                                                        color: 'white'

                                                    }}>

                                                        <span>

                                                            Stage: {fileStatus.apiStatus.progress.stage || 'processing'}

                                                        </span>

                                                        <span>

                                                            {fileStatus.apiStatus.progress.currentChunk || 0}/{fileStatus.apiStatus.progress.totalChunks || 1} chunks

                                                        </span>

                                                        <span>

                                                            {Math.round(fileStatus.apiStatus.progress.percentage || 0)}%

                                                        </span>

                                                    </div>

                                                )}

 

                                                {fileStatus.apiStatus?.errorDetails && (

                                                    <div style={{

                                                        marginTop: 4,

                                                        padding: 4,

                                                        backgroundColor: theme.colors.surface,

                                                        borderRadius: 3,

                                                        fontSize: 9,

                                                        color: theme.colors.error,

                                                        border: `1px solid ${theme.colors.error}`

                                                    }}>

                                                        Error: {fileStatus.apiStatus.errorDetails}

                                                    </div>

                                                )}

                                                {(fileStatus.apiStatus?.status === 'completed' || fileStatus.streamStatus === 'completed') && (

                                                    <div style={{ marginTop: 8, display: 'flex', justifyContent: 'flex-end', gap: 6 }}>

                                                        <button

                                                            onClick={() => handleDownloadFile(file.name)}

                                                            style={{

                                                                padding: '4px 10px',

                                                                backgroundColor: '#4caf50',

                                                                color: 'white',

                                                                border: 'none',

                                                                borderRadius: 4,

                                                                fontSize: 9,

                                                                fontWeight: 'bold',

                                                                cursor: 'pointer',

                                                                display: 'flex',

                                                                alignItems: 'center',

                                                                gap: 3,

                                                                transition: 'all 0.2s ease',

                                                                boxShadow: '0 2px 4px rgba(76, 175, 80, 0.3)'

                                                            }}

                                                            onMouseEnter={(e) => {

                                                                e.currentTarget.style.backgroundColor = '#45a049';

                                                                e.currentTarget.style.transform = 'translateY(-1px)';

                                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(76, 175, 80, 0.4)';

                                                            }}

                                                            onMouseLeave={(e) => {

                                                                e.currentTarget.style.backgroundColor = '#4caf50';

                                                                e.currentTarget.style.transform = 'translateY(0px)';

                                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(76, 175, 80, 0.3)';

                                                            }}

                                                            title={`Download diarized transcript (with speaker segregation & timestamps) for ${file.name}`}

                                                        >

                                                            👥  Diarized

                                                        </button>

 

                                                        <button

                                                            onClick={() => handleDownloadRawFile(file.name)}

                                                            style={{

                                                                padding: '4px 10px',

                                                                backgroundColor: '#2196f3',

                                                                color: 'white',

                                                                border: 'none',

                                                                borderRadius: 4,

                                                                fontSize: 9,

                                                                fontWeight: 'bold',

                                                                cursor: 'pointer',

                                                                display: 'flex',

                                                                alignItems: 'center',

                                                                gap: 3,

                                                                transition: 'all 0.2s ease',

                                                                boxShadow: '0 2px 4px rgba(33, 150, 243, 0.3)'

                                                            }}

                                                            onMouseEnter={(e) => {

                                                                e.currentTarget.style.backgroundColor = '#1976d2';

                                                                e.currentTarget.style.transform = 'translateY(-1px)';

                                                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(33, 150, 243, 0.4)';

                                                            }}

                                                            onMouseLeave={(e) => {

                                                                e.currentTarget.style.backgroundColor = '#2196f3';

                                                                e.currentTarget.style.transform = 'translateY(0px)';

                                                                e.currentTarget.style.boxShadow = '0 2px 4px rgba(33, 150, 243, 0.3)';

                                                            }}

                                                            title={`Download raw transcript (plain text) for ${file.name}`}

                                                        >

                                                            📄  Raw

                                                        </button>

                                                    </div>

                                                )}

                                            </>

                                        )

                                        }

                                    </div>

                                );

                            })}

                        </div>

                    </div>

                </div>

            )

            }

        </div >

    );

};

export default UploadPanel;//1170

 

 

 

 

 

 

 

 

 

 