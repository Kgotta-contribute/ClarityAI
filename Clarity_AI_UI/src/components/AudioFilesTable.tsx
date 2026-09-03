
import React, { useState, useEffect, useContext } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faList, faThLarge } from '@fortawesome/free-solid-svg-icons';
import { Tile, Button, TableBox } from 'design-language';
import TranscriptWindowChunked from './TranscriptWindowChunked';
import RetryPanel from './RetryPanel';
import FileProgressBar from './FileProgressBar';
import ErrorBoundary from './ErrorBoundary';
import ConfirmationDialog from './ConfirmationDialog';
import apiService, { type AudioFile } from './../services/apiService';
import { ThemeContext } from '../contexts/createThemeContext';
import type { FilterState } from '../types';
import './styles/index.css';

 

interface AudioFileData {

  url: unknown;

  id: string;

  fileName: string;

  duration: string;

  fileSize: string;

  fileStatus: 'Processing' | 'Completed' | 'Failed' | 'Pending' | 'Stopped';

  jobId: string;

  userName: string;

  userDomain: string;

  businessGroup: string;

  fileRcvDate: string;

  rawReceivedAt: string;

  startedProcessingAt?: string;

  processedAt?: string;

  processingDuration?: string;

}

 

interface AudioFilesTableProps {

  className?: string;

  filters?: FilterState;

  onFileSelect?: (file: AudioFileData) => void;

}

 

const AudioFilesTable: React.FC<AudioFilesTableProps> = ({ className = '', filters, onFileSelect }) => {

  const [audioFiles, setAudioFiles] = useState<AudioFileData[]>([]);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState<string | null>(null);

  const pageSize = 15;

  const [sortIndex, setSortIndex] = useState<number | null>(null);

  const themeContext = useContext(ThemeContext);

  const currentTheme = themeContext?.currentTheme ?? 'dark';

 

  const [showTranscriptPopover, setShowTranscriptPopover] = useState(false);

  const [selectedFile, setSelectedFile] = useState<AudioFileData | null>(null);

  const [statusMessage, setStatusMessage] = useState<{ text: string; type: 'info' | 'warning' | 'error' | 'success' } | null>(null);

  const [retryingFiles, setRetryingFiles] = useState<Set<string>>(new Set());

  const [showRetryPanel, setShowRetryPanel] = useState(false);

  const [retryFile, setRetryFile] = useState<AudioFileData | null>(null);

  const [showProgressBar, setShowProgressBar] = useState(false);

  const [progressFile, setProgressFile] = useState<AudioFileData | null>(null);

  const [refreshTrigger, setRefreshTrigger] = useState(0);

  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const [fileToDelete, setFileToDelete] = useState<AudioFileData | null>(null);

  const [deletingFiles, setDeletingFiles] = useState<Set<string>>(new Set());

 

  const formatDuration = (duration: string | number | null | undefined): string => {

    if (!duration) {

      return '00:00:00';

    }

 

    if (typeof duration === 'string') {

      return duration;

    }

 

    if (typeof duration === 'number' && duration > 0) {

      const hours = Math.floor(duration / 3600);

      const minutes = Math.floor((duration % 3600) / 60);

      const seconds = Math.floor(duration % 60);

 

      if (hours > 0) {

        return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

      }

      return `00:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

    }

 

    return '00:00:00';

  };

 

  const mapApiDataToAudioFiles = (apiRecords: AudioFile[]): AudioFileData[] => {

    return apiRecords.map((record) => {

      const fileSizeMB = (record.sizeBytes / (1024 * 1024)).toFixed(2);

 

      const d = new Date(record.receivedAt);

      const mm = String(d.getMonth() + 1).padStart(2, '0');

      const dd = String(d.getDate()).padStart(2, '0');

      const yyyy = d.getFullYear();

      const formattedDate = `${dd}/${mm}/${yyyy}`;

      let normalizedStatus: AudioFileData['fileStatus'];

      const status = (record.fileStatus || record.status || 'unknown').toLowerCase();

      switch (status) {

        case 'completed':

          normalizedStatus = 'Completed';

          break;

        case 'processing':

          normalizedStatus = 'Processing';

          break;

        case 'failed':

          normalizedStatus = 'Failed';

          break;

        case 'stopped':

          normalizedStatus = 'Stopped';

          break;

        default:

          normalizedStatus = 'Pending';

          break;

      }

 

      return {

        id: record.fileID || record.jobID,

        fileName: record.fileName,

        duration: formatDuration(record.duration),

        fileSize: `${fileSizeMB} MB`,

        fileStatus: normalizedStatus,

        jobId: record.jobID,

        userName: record.userName || '-',

        userDomain: record.domainID || '-',

        businessGroup: record.businessGroup || '-',

        fileRcvDate: formattedDate,

        rawReceivedAt: record.receivedAt,

        startedProcessingAt: record.startedProcessingAt,

        processedAt: record.processedAt,

        processingDuration: record.fileProcessingDuration,

        url: record.sourceFileName,

      };

    });

  };

 

  const fetchAudioFiles = async () => {

    setLoading(true);

    setError(null);

 

    try {

      const response = await apiService.getAudioFiles(1, 1000);

      let mappedFiles = mapApiDataToAudioFiles(response.records);

      if (filters?.convoStartDateValue && filters?.convoEndDateValue) {
        const start = new Date(filters.convoStartDateValue);
        start.setHours(0, 0, 0, 0);
        
        const end = new Date(filters.convoEndDateValue);
        end.setHours(23, 59, 59, 999);

        mappedFiles = mappedFiles.filter(file => {
          if (!file.rawReceivedAt) return false;
          const fileDate = new Date(file.rawReceivedAt);
          return fileDate >= start && fileDate <= end;
        });
      }

      setAudioFiles(mappedFiles);

    } catch (err) {

      console.error('Error fetching audio files:', err);

      setError(err instanceof Error ? err.message : 'Failed to fetch audio files');

    } finally {

      setLoading(false);

      setShowDeleteDialog(false);

    }

  };

 

  useEffect(() => {

    fetchAudioFiles();

  }, [filters, refreshTrigger]); // eslint-disable-line react-hooks/exhaustive-deps

 

  useEffect(() => {

    if (!filters) {

      fetchAudioFiles();

    }

  }, []); // eslint-disable-line react-hooks/exhaustive-deps

 

  const handleTableSort = (value: { index: number; direction: 'asc' | 'desc' }) => {

    setSortIndex(value.index);

  };

 

  const handleTableClick = (clickData: { cellIndex: number; rowIndex: number; row: unknown[]; headers: string[] }) => {

    if (!clickData.row || clickData.row.length === 0) {

      return;

    }

 

    if (clickData.cellIndex === 0) {

      const clickedFile = audioFiles[clickData.rowIndex];

 

      if (clickedFile) {

        if (clickedFile.fileStatus !== 'Completed') {

 

          let messageText = '';

          let messageType: 'info' | 'warning' | 'error' | 'success' = 'warning';

 

          switch (clickedFile.fileStatus) {

            case 'Processing':

              messageText = `File "${clickedFile.fileName}" is currently being processed. Please wait for processing to complete.`;

              messageType = 'info';

              break;

            case 'Pending':

              messageText = `File "${clickedFile.fileName}" is pending processing. Transcripts will be available once processing is complete.`;

              messageType = 'info';

              break;

            case 'Failed':

              messageText = `File "${clickedFile.fileName}" processing failed. Please contact support or try uploading again.`;

              messageType = 'error';

              break;

            case 'Stopped':

              messageText = `File "${clickedFile.fileName}" processing was stopped. You can retry processing this file.`;

              messageType = 'warning';

              break;

            default:

              messageText = `File "${clickedFile.fileName}" is not ready. Transcripts are only available for completed files.`;

              messageType = 'warning';

          }

 

          setStatusMessage({ text: messageText, type: messageType });

 

          setTimeout(() => {

            setStatusMessage(null);

          }, 10000);

 

          return;

        }

 

        setSelectedFile(clickedFile);

        setShowTranscriptPopover(true);

 

        if (onFileSelect) {

          onFileSelect(clickedFile);

        }

      }

    }

 

    if (clickData.cellIndex === 1) {

      const clickedFile = audioFiles[clickData.rowIndex];

 

      if (clickedFile) {

        if (clickedFile.fileStatus === 'Processing') {

          setProgressFile(clickedFile);

          setShowProgressBar(true);

          return;

        }

 

        if (clickedFile.fileStatus === 'Failed' || clickedFile.fileStatus === 'Stopped') {

          handleRetryFile(clickedFile);

        }

      }

    }

 

    if (clickData.cellIndex === 2) {

      const clickedFile = audioFiles[clickData.rowIndex];

 

      if (clickedFile && !deletingFiles.has(clickedFile.id)) {

        handleDeleteClick(clickedFile);

      }

    }

  };

 

  const handleDeleteClick = (file: AudioFileData) => {

    setFileToDelete(file);

    setShowDeleteDialog(true);

  };

 

  const handleDeleteConfirm = async () => {

    if (!fileToDelete) return;

 

    setDeletingFiles(prev => new Set(prev).add(fileToDelete.id));

    setLoading(true);

 

    try {

      const result = await apiService.deleteAudioFile(fileToDelete.jobId, fileToDelete.id);

 

      if (result.success) {

        setRefreshTrigger(prev => prev + 1);

        setShowDeleteDialog(false);

        setStatusMessage({

          text: `"${fileToDelete.fileName}" has been deleted successfully.`,

          type: 'success',

        });

 

        // Refresh the table data from API

      } else {

        setStatusMessage({

          text: `Failed to delete "${fileToDelete.fileName}": ${result.message}`,

          type: 'error',

        });

      }

    } catch (err) {

      console.error('Delete error in component:', err);

      setStatusMessage({

        text: `Error deleting "${fileToDelete.fileName}". Please try again later.`,

        type: 'error',

      });

    } finally {

      setShowDeleteDialog(false);

      setDeletingFiles(prev => {

        const newSet = new Set(prev);

        newSet.delete(fileToDelete.id);

        return newSet;

      });

      setFileToDelete(null);

    }

 

    setTimeout(() => {

      setStatusMessage(null);

    }, 8000);

  };

 

  const handleDeleteCancel = () => {

    setShowDeleteDialog(false);

    setFileToDelete(null);

  };

 

  const handleRetryFile = async (file: AudioFileData) => {

    if (retryingFiles.has(file.id)) {

      return;

    }

 

    setRetryingFiles(prev => new Set(prev).add(file.id));

 

    try {

      const result = await apiService.retryFailedFile(file.jobId, file.id);

 

      if (result.success) {

        setStatusMessage({

          text: `Retry initiated for "${file.fileName}". Opening status panel...`,

          type: 'success',

        });

 

        setRetryFile(file);

        setShowRetryPanel(true);

      } else {

        setStatusMessage({

          text: `Failed to retry "${file.fileName}": ${result.message}`,

          type: 'error',

        });

 

        setRetryingFiles(prev => {

          const newSet = new Set(prev);

          newSet.delete(file.id);

          return newSet;

        });

      }

    } catch {

      setStatusMessage({

        text: `Error retrying "${file.fileName}". Please try again later.`,

        type: 'error',

      });

 

      setRetryingFiles(prev => {

        const newSet = new Set(prev);

        newSet.delete(file.id);

        return newSet;

      });

    }

 

    setTimeout(() => {

      setStatusMessage(null);

    }, 8000);

  };

 

  const handleCloseRetryPanel = () => {

    setShowRetryPanel(false);

    setRetryFile(null);

 

    if (retryFile) {

      setRetryingFiles(prev => {

        const newSet = new Set(prev);

        newSet.delete(retryFile.id);

        return newSet;

      });

    }

 

    setRefreshTrigger(prev => prev + 1);

  };

 

  const handleCloseTranscript = () => {

    setShowTranscriptPopover(false);

    setSelectedFile(null);

  };

 

  const getProcessingDuration = (file: AudioFileData): string => {
    if (file.processingDuration && file.processingDuration !== '-') return file.processingDuration;
    if (!file.startedProcessingAt || !file.processedAt) {
      if (file.fileStatus === 'Processing') return 'Processing...';
      return '-';
    }
    try {
      const start = new Date(file.startedProcessingAt).getTime();
      const end = new Date(file.processedAt).getTime();
      const diffSecs = Math.round((end - start) / 1000);
      if (isNaN(diffSecs) || diffSecs < 0) return '-';
      if (diffSecs < 60) return `${diffSecs}s`;
      const mins = Math.floor(diffSecs / 60);
      const secs = diffSecs % 60;
      return `${mins}m ${secs}s`;
    } catch {
      return '-';
    }
  };

  const formatSubHeader = (file: AudioFileData): string => {
    const ext = file.fileName.split('.').pop()?.toUpperCase() || 'MP3';
    let dateStr = file.fileRcvDate || '';
    let timeStr = '';
    if (file.rawReceivedAt) {
      try {
        const d = new Date(file.rawReceivedAt);
        if (!isNaN(d.getTime())) {
          const dd = String(d.getDate()).padStart(2, '0');
          const mm = String(d.getMonth() + 1).padStart(2, '0');
          const yyyy = d.getFullYear();
          dateStr = `${dd}/${mm}/${yyyy}`;
          timeStr = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
        }
      } catch {
        // fallback
      }
    }
    return [ext, dateStr, timeStr].filter(Boolean).join('  •  ');
  };

  const renderStatusBadge = (status: AudioFileData['fileStatus']) => {
    const isLight = currentTheme === 'light';
    let bg = isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.12)';
    let border = isLight ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.25)';
    let dotColor = '#10b981';
    let textColor = isLight ? '#059669' : '#34d399';
    let text = 'Completed';

    switch (status) {
      case 'Completed':
        bg = isLight ? 'rgba(16, 185, 129, 0.1)' : 'rgba(16, 185, 129, 0.12)';
        border = isLight ? '1px solid rgba(16, 185, 129, 0.35)' : '1px solid rgba(16, 185, 129, 0.25)';
        dotColor = '#10b981';
        textColor = isLight ? '#059669' : '#34d399';
        text = 'Completed';
        break;
      case 'Processing':
        bg = isLight ? 'rgba(59, 130, 246, 0.1)' : 'rgba(59, 130, 246, 0.12)';
        border = isLight ? '1px solid rgba(59, 130, 246, 0.35)' : '1px solid rgba(59, 130, 246, 0.25)';
        dotColor = '#3b82f6';
        textColor = isLight ? '#2563eb' : '#60a5fa';
        text = 'Processing';
        break;
      case 'Failed':
      case 'Stopped':
        bg = isLight ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.12)';
        border = isLight ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(239, 68, 68, 0.25)';
        dotColor = '#ef4444';
        textColor = isLight ? '#dc2626' : '#f87171';
        text = status;
        break;
      default:
        bg = isLight ? 'rgba(245, 158, 11, 0.1)' : 'rgba(245, 158, 11, 0.12)';
        border = isLight ? '1px solid rgba(245, 158, 11, 0.35)' : '1px solid rgba(245, 158, 11, 0.25)';
        dotColor = '#f59e0b';
        textColor = isLight ? '#d97706' : '#fbbf24';
        text = status || 'Pending';
        break;
    }

    return (
      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        padding: '3px 12px',
        borderRadius: '16px',
        backgroundColor: bg,
        border: border,
        fontSize: '12px',
        fontWeight: 500,
        color: textColor,
        userSelect: 'none'
      }}>
        <span style={{
          width: '6px',
          height: '6px',
          borderRadius: '50%',
          backgroundColor: dotColor,
          boxShadow: `0 0 6px ${dotColor}`
        }} />
        <span>{text}</span>
      </div>
    );
  };

  const getFileIconStyle = (fileName: string) => {
    const lower = fileName.toLowerCase();
    if (lower.endsWith('.wav')) {
      return {
        background: 'linear-gradient(135deg, #047857 0%, #10b981 100%)',
        boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
      };
    }
    if (lower.endsWith('.mp4') || lower.endsWith('.mov') || lower.endsWith('.mkv') || lower.endsWith('.webm')) {
      return {
        background: 'linear-gradient(135deg, #be123c 0%, #e11d48 100%)',
        boxShadow: '0 4px 12px rgba(225, 29, 72, 0.35)',
      };
    }
    // Default audio / MP3
    return {
      background: 'linear-gradient(135deg, #5b21b6 0%, #7c3aed 100%)',
      boxShadow: '0 4px 12px rgba(124, 58, 237, 0.35)',
    };
  };
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortOption, setSortOption] = useState('newest');
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [appliedStartDate, setAppliedStartDate] = useState('');
  const [appliedEndDate, setAppliedEndDate] = useState('');

  const handleApplyDateFilter = () => {
    setAppliedStartDate(startDate);
    setAppliedEndDate(endDate);
  };

  const handleResetDateFilter = () => {
    setStartDate('');
    setEndDate('');
    setAppliedStartDate('');
    setAppliedEndDate('');
  };

  const totalFilesCount = audioFiles.length;
  const completedCount = audioFiles.filter(f => f.fileStatus === 'Completed').length;
  const processingCount = audioFiles.filter(f => f.fileStatus === 'Processing' || f.fileStatus === 'Pending').length;

  const calculateTotalDuration = (files: AudioFileData[]): string => {
    let totalSecs = 0;
    files.forEach(f => {
      if (!f.duration || f.duration === '-') return;
      const parts = f.duration.split(':').map(Number);
      if (parts.length === 3) {
        totalSecs += (parts[0] * 3600) + (parts[1] * 60) + parts[2];
      } else if (parts.length === 2) {
        totalSecs += (parts[0] * 60) + parts[1];
      }
    });
    if (totalSecs === 0) return '0m';
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    if (hrs > 0) {
      return `${hrs}h ${mins}m`;
    }
    return `${mins}m`;
  };

  const calculateTotalSize = (files: AudioFileData[]): string => {
    let totalMB = 0;
    files.forEach(f => {
      if (!f.fileSize) return;
      const num = parseFloat(f.fileSize.replace(/[^0-9.]/g, ''));
      if (!isNaN(num)) {
        totalMB += num;
      }
    });
    return `${totalMB.toFixed(1)} MB`;
  };

  const totalDurationStr = calculateTotalDuration(audioFiles);
  const totalSizeStr = calculateTotalSize(audioFiles);

  const getSortedAndFilteredFiles = (): AudioFileData[] => {
    let list = [...audioFiles];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      list = list.filter(f =>
        f.fileName.toLowerCase().includes(q) ||
        f.userName.toLowerCase().includes(q) ||
        f.fileStatus.toLowerCase().includes(q)
      );
    }

    if (statusFilter !== 'all') {
      list = list.filter(f => f.fileStatus.toLowerCase() === statusFilter.toLowerCase());
    }

    if (appliedStartDate) {
      const startTimestamp = new Date(appliedStartDate).setHours(0, 0, 0, 0);
      list = list.filter(f => {
        if (!f.rawReceivedAt) return false;
        const fileTime = new Date(f.rawReceivedAt).getTime();
        return fileTime >= startTimestamp;
      });
    }

    if (appliedEndDate) {
      const endTimestamp = new Date(appliedEndDate).setHours(23, 59, 59, 999);
      list = list.filter(f => {
        if (!f.rawReceivedAt) return false;
        const fileTime = new Date(f.rawReceivedAt).getTime();
        return fileTime <= endTimestamp;
      });
    }

    const parseDurationSecs = (durStr: string) => {
      if (!durStr || durStr === '-') return 0;
      const p = durStr.split(':').map(Number);
      if (p.length === 3) return p[0] * 3600 + p[1] * 60 + p[2];
      if (p.length === 2) return p[0] * 60 + p[1];
      return 0;
    };

    const parseSizeMB = (szStr: string) => {
      if (!szStr) return 0;
      return parseFloat(szStr.replace(/[^0-9.]/g, '')) || 0;
    };

    list.sort((a, b) => {
      const timeA = a.rawReceivedAt ? new Date(a.rawReceivedAt).getTime() : 0;
      const timeB = b.rawReceivedAt ? new Date(b.rawReceivedAt).getTime() : 0;

      switch (sortOption) {
        case 'newest':
          return timeB - timeA;
        case 'oldest':
          return timeA - timeB;
        case 'duration_desc':
          return parseDurationSecs(b.duration) - parseDurationSecs(a.duration);
        case 'duration_asc':
          return parseDurationSecs(a.duration) - parseDurationSecs(b.duration);
        case 'size_desc':
          return parseSizeMB(b.fileSize) - parseSizeMB(a.fileSize);
        case 'size_asc':
          return parseSizeMB(a.fileSize) - parseSizeMB(b.fileSize);
        case 'name_asc':
          return a.fileName.localeCompare(b.fileName);
        case 'name_desc':
          return b.fileName.localeCompare(a.fileName);
        default:
          return timeB - timeA;
      }
    });

    return list;
  };

  const prepareTableData = () => {

    let filteredFiles = getSortedAndFilteredFiles();

    const uniqueStatuses = Array.from(new Set(filteredFiles.map(f => f.fileStatus)));

    const header = [

      { name: 'File Name', width: 300, filterType: 'keyword' },

      { name: 'Retry', width: 80, noFilter: true },

      { name: 'Delete', width: 80, noFilter: true },

      { name: 'Duration', width: 130, noFilter: true },

      { name: 'File Size', width: 100, noFilter: true },

      {

        name: 'File Status',

        width: 140,

        filterType: 'select',

        filterOptions: uniqueStatuses,

      },

      { name: 'User Name', width: 150, filterType: 'keyword' },

      { name: 'File Received Date', width: 150, filterType: 'keyword' },

      { name: 'File Processing Duration', width: 180, noFilter: true },

    ];

    const body = filteredFiles.map((file) => [

      <div style={{ display: 'flex', alignItems: 'center', gap: '14px', padding: '3px 0' }}>
        <div style={{
          width: '38px',
          height: '38px',
          borderRadius: '8px',
          ...getFileIconStyle(file.fileName),
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
        }}>
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
            <path d="M9 18V5l12-2v13" />
            <circle cx="6" cy="18" r="3" fill="currentColor" />
            <circle cx="18" cy="16" r="3" fill="currentColor" />
          </svg>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', minWidth: 0, textAlign: 'left' }}>
          <span
            style={{
              color: currentTheme === 'light' ? '#0f172a' : '#f8fafc',
              fontWeight: 600,
              fontSize: '13.5px',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis'
            }}
            title={file.fileName}
          >
            {file.fileName}
          </span>
          <span style={{
            color: currentTheme === 'light' ? '#64748b' : '#94a3b8',
            fontSize: '11px',
            fontWeight: 400,
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            whiteSpace: 'nowrap'
          }}>
            {formatSubHeader(file)}
          </span>
        </div>
      </div>,

      file.fileStatus === 'Failed' || file.fileStatus === 'Stopped' ? (
        <span style={{ textAlign: 'center', cursor: 'pointer', fontSize: '16px', color: '#4299e1', userSelect: 'none' }}>
          🔄
        </span>
      ) : file.fileStatus === 'Processing' ? (
        <span style={{ textAlign: 'center', cursor: 'pointer', fontSize: '16px', color: '#4299e1', userSelect: 'none' }}>
          👁️
        </span>
      ) : (
        '-'
      ),

      <span style={{
        textAlign: 'center',
        cursor: deletingFiles.has(file.id) ? 'default' : 'pointer',
        fontSize: '16px',
        color: deletingFiles.has(file.id) ? '#718096' : '#dc3545',
        userSelect: 'none',
        opacity: deletingFiles.has(file.id) ? 0.5 : 1
      }}>
        {deletingFiles.has(file.id) ? '⏳' : '🗑️'}
      </span>,

      <div style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '7px',
        color: currentTheme === 'light' ? '#334155' : '#cbd5e1',
        fontSize: '13px',
        fontWeight: 500
      }}>
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: currentTheme === 'light' ? '#64748b' : '#94a3b8', flexShrink: 0 }}>
          <circle cx="12" cy="12" r="10" />
          <polyline points="12 6 12 12 16 14" />
        </svg>
        <span>{file.duration || '00:00:00'}</span>
      </div>,

      file.fileSize || '0 MB',

      renderStatusBadge(file.fileStatus),

      file.userName || '-',

      file.fileRcvDate || '-',

      getProcessingDuration(file)

    ]);

    return { header, body, sortedFiles: filteredFiles };

  };

 

  if (loading) {

    return (

      <div className="audio-files-loading">

        <div className="loading-spinner"></div>

        <span>Loading audio files...</span>

      </div>

    );

  }

 

  if (error) {

    return (

      <div className="audio-files-error">

        <p>Error loading audio files: {error}</p>

        <Button onClick={() => fetchAudioFiles()}>Retry</Button>

      </div>

    );

  }

 

  const tableData = prepareTableData();

 

  const tableContainerStyle = {
    backgroundColor: currentTheme === 'light' ? '#ffffff' : 'rgba(13, 17, 38, 0.6)',
    color: currentTheme === 'light' ? '#1a202c' : '#e2e8f0',
    borderRadius: '16px',
    border: currentTheme === 'light' ? '1px solid #e2e8f0' : '1px solid rgba(255, 255, 255, 0.05)',
    backdropFilter: 'blur(16px)',
    boxShadow: currentTheme === 'light' ? '0 4px 6px -1px rgba(0, 0, 0, 0.05)' : '0 8px 32px rgba(0, 0, 0, 0.2)',
    transition: 'background-color 0.3s ease, color 0.3s ease'
  };

 

  return (

    <div className={`audio-files-table-container ${className}`}>

      <style>{`
        .audio-metrics-grid {
          display: grid;
          grid-template-columns: repeat(5, minmax(0, 1fr));
          gap: 1rem;
          width: 100%;
          margin-bottom: 1.25rem;
        }
        @media (max-width: 1200px) {
          .audio-metrics-grid {
            grid-template-columns: repeat(3, minmax(0, 1fr));
          }
        }
        @media (max-width: 768px) {
          .audio-metrics-grid {
            grid-template-columns: repeat(1, minmax(0, 1fr));
          }
        }
        .audio-metric-card {
          background: rgba(13, 17, 38, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 1.1rem 1.25rem;
          display: flex;
          align-items: center;
          gap: 1rem;
          backdrop-filter: blur(16px);
          box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
          transition: all 0.2s ease;
        }
        .audio-metric-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }
        .audio-metric-icon-circle {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 17px;
          flex-shrink: 0;
        }
        .audio-metric-content {
          display: flex;
          flex-direction: column;
          min-width: 0;
        }
        .audio-metric-title {
          font-size: 0.78rem;
          color: #94a3b8;
          font-weight: 500;
          margin-bottom: 2px;
          white-space: nowrap;
        }
        .audio-metric-value {
          font-size: 1.45rem;
          font-weight: 700;
          color: #ffffff;
          line-height: 1.2;
          white-space: nowrap;
        }
        .audio-metric-subtitle {
          font-size: 0.75rem;
          color: #64748b;
          margin-top: 2px;
          white-space: nowrap;
        }

        .audio-controls-bar {
          background: rgba(13, 17, 38, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 12px;
          padding: 0.75rem 1.25rem;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 1rem;
          backdrop-filter: blur(16px);
          margin-bottom: 1.25rem;
          flex-wrap: wrap;
        }
        .audio-search-box {
          position: relative;
          display: flex;
          align-items: center;
          flex: 1;
          max-width: 320px;
          min-width: 220px;
        }
        .audio-search-icon {
          position: absolute;
          left: 12px;
          color: #64748b;
          font-size: 14px;
          pointer-events: none;
        }
        .audio-search-input {
          width: 100%;
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 8px 12px 8px 36px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          transition: all 0.2s ease;
        }
        .audio-search-input:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
          background: rgba(0, 0, 0, 0.4);
        }
        .audio-search-input::placeholder {
          color: #64748b;
        }
        .audio-filters-right {
          display: flex;
          align-items: center;
          gap: 1.25rem;
          flex-wrap: wrap;
        }
        .audio-filter-item {
          display: flex;
          align-items: center;
          gap: 8px;
        }
        .audio-filter-label {
          font-size: 13px;
          color: #94a3b8;
          font-weight: 500;
          white-space: nowrap;
        }
        .audio-select-dropdown {
          background: rgba(0, 0, 0, 0.3);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-radius: 8px;
          padding: 7px 28px 7px 12px;
          color: #ffffff;
          font-size: 13px;
          outline: none;
          cursor: pointer;
          appearance: none;
          background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%2394a3b8' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
          background-repeat: no-repeat;
          background-position: right 8px center;
          background-size: 14px;
          transition: all 0.2s ease;
        }
        .audio-select-dropdown:focus {
          border-color: #3b82f6;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.25);
        }
        .audio-select-dropdown option {
          background: #0f172a;
          color: #ffffff;
        }
        .audio-view-mode-toggle {
          display: inline-flex;
          align-items: center;
          gap: 4px;
          background: rgba(0, 0, 0, 0.35);
          padding: 4px;
          border-radius: 10px;
          border: 1px solid rgba(255, 255, 255, 0.1);
        }
        .audio-view-btn {
          width: 36px;
          height: 36px;
          border-radius: 8px;
          border: 1px solid transparent;
          background: transparent;
          color: #94a3b8;
          display: flex;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .audio-view-btn.active {
          background: rgba(59, 130, 246, 0.2);
          border: 1.5px solid #3b82f6;
          color: #60a5fa;
          box-shadow: 0 0 12px rgba(59, 130, 246, 0.35);
        }
        .audio-view-btn:hover:not(.active) {
          background: rgba(255, 255, 255, 0.08);
          color: #f1f5f9;
        }

        /* Grid View Styling */
        .audio-grid-container {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
          gap: 1.25rem;
          width: 100%;
        }
        .audio-grid-card {
          background: rgba(13, 17, 38, 0.6);
          border: 1px solid rgba(255, 255, 255, 0.06);
          border-radius: 14px;
          padding: 1.25rem;
          display: flex;
          flex-direction: column;
          gap: 1rem;
          backdrop-filter: blur(16px);
          transition: all 0.2s ease;
        }
        .audio-grid-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.12);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
        }

        /* ─── High Contrast Light Mode Overrides ─── */
        body.LightMode .audio-metric-card,
        body.theme-light .audio-metric-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }
        body.LightMode .audio-metric-card:hover,
        body.theme-light .audio-metric-card:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08) !important;
        }
        body.LightMode .audio-metric-title,
        body.theme-light .audio-metric-title {
          color: #64748b !important;
        }
        body.LightMode .audio-metric-value,
        body.theme-light .audio-metric-value {
          color: #0f172a !important;
        }
        body.LightMode .audio-metric-subtitle,
        body.theme-light .audio-metric-subtitle {
          color: #94a3b8 !important;
        }

        body.LightMode .audio-controls-bar,
        body.theme-light .audio-controls-bar {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }
        body.LightMode .audio-search-input,
        body.theme-light .audio-search-input {
          background: #f8fafc !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
        }
        body.LightMode .audio-search-input:focus,
        body.theme-light .audio-search-input:focus {
          border-color: #2563eb !important;
          background: #ffffff !important;
          box-shadow: 0 0 0 2px rgba(37, 99, 235, 0.15) !important;
        }
        body.LightMode .audio-search-input::placeholder,
        body.theme-light .audio-search-input::placeholder {
          color: #94a3b8 !important;
        }
        body.LightMode .audio-select-dropdown,
        body.theme-light .audio-select-dropdown {
          background-color: #f8fafc !important;
          border: 1px solid #cbd5e1 !important;
          color: #0f172a !important;
        }
        body.LightMode .audio-select-dropdown option,
        body.theme-light .audio-select-dropdown option {
          background: #ffffff !important;
          color: #0f172a !important;
        }
        body.LightMode .audio-filter-label,
        body.theme-light .audio-filter-label {
          color: #475569 !important;
        }
        body.LightMode .audio-view-mode-toggle,
        body.theme-light .audio-view-mode-toggle {
          background: #f1f5f9 !important;
          border: 1px solid #e2e8f0 !important;
        }
        body.LightMode .audio-view-btn,
        body.theme-light .audio-view-btn {
          color: #64748b !important;
        }
        body.LightMode .audio-view-btn.active,
        body.theme-light .audio-view-btn.active {
          background: #ffffff !important;
          border: 1.5px solid #2563eb !important;
          color: #2563eb !important;
          box-shadow: 0 2px 6px rgba(37, 99, 235, 0.2) !important;
        }
        body.LightMode .audio-view-btn:hover:not(.active),
        body.theme-light .audio-view-btn:hover:not(.active) {
          background: #e2e8f0 !important;
          color: #1e293b !important;
        }
        body.LightMode .audio-grid-card,
        body.theme-light .audio-grid-card {
          background: #ffffff !important;
          border: 1px solid #e2e8f0 !important;
          box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04) !important;
        }
        body.LightMode .audio-grid-card:hover,
        body.theme-light .audio-grid-card:hover {
          border-color: #cbd5e1 !important;
          box-shadow: 0 6px 16px rgba(0, 0, 0, 0.08) !important;
        }

        /* ─── Light Mode TableBox & Table Elements ─── */
        body.LightMode .audio-files-table,
        body.theme-light .audio-files-table,
        body.LightMode .audio-files-table-wrapper,
        body.theme-light .audio-files-table-wrapper,
        body.LightMode .TableBox,
        body.theme-light .TableBox,
        body.LightMode [class*="TableBox"],
        body.theme-light [class*="TableBox"],
        body.LightMode [class*="TableGrid"],
        body.theme-light [class*="TableGrid"],
        body.LightMode [class*="Tile"],
        body.theme-light [class*="Tile"],
        body.LightMode main {
          background-color: #ffffff !important;
          background: #ffffff !important;
          border-color: #e2e8f0 !important;
          color: #0f172a !important;
        }

        body.LightMode .TableHeaderContainer,
        body.theme-light .TableHeaderContainer,
        body.LightMode [class*="TableHeader"],
        body.theme-light [class*="TableHeader"],
        body.LightMode .TableBox header,
        body.theme-light .TableBox header,
        body.LightMode thead,
        body.theme-light thead,
        body.LightMode thead tr,
        body.theme-light thead tr {
          background-color: #f8fafc !important;
          background: #f8fafc !important;
          color: #334155 !important;
          border-bottom: 1.5px solid #e2e8f0 !important;
        }

        body.LightMode .TableHeaderContainer th,
        body.theme-light .TableHeaderContainer th,
        body.LightMode .TableBox th,
        body.theme-light .TableBox th,
        body.LightMode [class*="HeaderCell"],
        body.theme-light [class*="HeaderCell"],
        body.LightMode [class*="TableHeader"] span,
        body.theme-light [class*="TableHeader"] span,
        body.LightMode [class*="TableHeader"] div,
        body.theme-light [class*="TableHeader"] div,
        body.LightMode th {
          background-color: #f8fafc !important;
          background: #f8fafc !important;
          color: #334155 !important;
          font-weight: 700 !important;
          border-bottom: 1.5px solid #e2e8f0 !important;
        }

        body.LightMode .TableBox tr,
        body.theme-light .TableBox tr,
        body.LightMode [class*="TableRow"],
        body.theme-light [class*="TableRow"],
        body.LightMode tbody tr,
        body.theme-light tbody tr {
          background-color: #ffffff !important;
          background: #ffffff !important;
          border-bottom: 1px solid #f1f5f9 !important;
          color: #0f172a !important;
        }

        body.LightMode .TableBox tr:hover,
        body.theme-light .TableBox tr:hover,
        body.LightMode [class*="TableRow"]:hover,
        body.theme-light [class*="TableRow"]:hover,
        body.LightMode tbody tr:hover,
        body.theme-light tbody tr:hover {
          background-color: #f8fafc !important;
          background: #f8fafc !important;
        }

        body.LightMode .TableBox td,
        body.theme-light .TableBox td,
        body.LightMode [class*="TableCell"],
        body.theme-light [class*="TableCell"],
        body.LightMode tbody td,
        body.theme-light tbody td,
        body.LightMode td {
          color: #1e293b !important;
          border-bottom: 1px solid #f1f5f9 !important;
          background-color: transparent !important;
        }

        body.LightMode .table-pagination,
        body.theme-light .table-pagination,
        body.LightMode [class*="Pagination"],
        body.theme-light [class*="Pagination"],
        body.LightMode [class*="TableFooter"],
        body.theme-light [class*="TableFooter"] {
          background-color: #ffffff !important;
          background: #ffffff !important;
          border-top: 1px solid #e2e8f0 !important;
          color: #64748b !important;
        }
      `}</style>

      {/* Top 5 Metric Cards matching Image 1 */}
      <div className="audio-metrics-grid">
        {/* Total Files */}
        <div className="audio-metric-card">
          <div className="audio-metric-icon-circle" style={{ background: 'rgba(59, 130, 246, 0.12)', border: '1px solid rgba(59, 130, 246, 0.25)', color: '#3b82f6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 18V5l12-2v13" />
              <circle cx="6" cy="18" r="3" fill="currentColor" />
              <circle cx="18" cy="16" r="3" fill="currentColor" />
            </svg>
          </div>
          <div className="audio-metric-content">
            <span className="audio-metric-title">Total Files</span>
            <span className="audio-metric-value">{totalFilesCount}</span>
            <span className="audio-metric-subtitle">uploaded audio</span>
          </div>
        </div>

        {/* Completed */}
        <div className="audio-metric-card">
          <div className="audio-metric-icon-circle" style={{ background: 'rgba(16, 185, 129, 0.12)', border: '1px solid rgba(16, 185, 129, 0.25)', color: '#10b981' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="audio-metric-content">
            <span className="audio-metric-title">Completed</span>
            <span className="audio-metric-value">{completedCount}</span>
            <span className="audio-metric-subtitle">Successfully processed</span>
          </div>
        </div>

        {/* Processing */}
        <div className="audio-metric-card">
          <div className="audio-metric-icon-circle" style={{ background: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.25)', color: '#f59e0b' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" />
            </svg>
          </div>
          <div className="audio-metric-content">
            <span className="audio-metric-title">Processing</span>
            <span className="audio-metric-value">{processingCount}</span>
            <span className="audio-metric-subtitle">In progress</span>
          </div>
        </div>

        {/* Total Duration */}
        <div className="audio-metric-card">
          <div className="audio-metric-icon-circle" style={{ background: 'rgba(168, 85, 247, 0.12)', border: '1px solid rgba(168, 85, 247, 0.25)', color: '#a855f7' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
          </div>
          <div className="audio-metric-content">
            <span className="audio-metric-title">Total Duration</span>
            <span className="audio-metric-value">{totalDurationStr}</span>
            <span className="audio-metric-subtitle">Across all files</span>
          </div>
        </div>

        {/* Total Size */}
        <div className="audio-metric-card">
          <div className="audio-metric-icon-circle" style={{ background: 'rgba(20, 184, 166, 0.12)', border: '1px solid rgba(20, 184, 166, 0.25)', color: '#14b8a6' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="2" y="2" width="20" height="8" rx="2" ry="2" />
              <rect x="2" y="14" width="20" height="8" rx="2" ry="2" />
              <line x1="6" y1="6" x2="6.01" y2="6" />
              <line x1="6" y1="18" x2="6.01" y2="18" />
            </svg>
          </div>
          <div className="audio-metric-content">
            <span className="audio-metric-title">Total Size</span>
            <span className="audio-metric-value">{totalSizeStr}</span>
            <span className="audio-metric-subtitle">Storage used</span>
          </div>
        </div>
      </div>

      {/* Filter and Control Bar matching Image 1 */}
      <div className="audio-controls-bar">
        {/* Search input */}
        <div className="audio-search-box">
          <span className="audio-search-icon">🔍</span>
          <input
            type="text"
            className="audio-search-input"
            placeholder="Search files..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '10px',
                background: 'none',
                border: 'none',
                color: '#94a3b8',
                cursor: 'pointer',
                fontSize: '12px'
              }}
            >
              ✕
            </button>
          )}
        </div>

        {/* Date Filter Controls matching Image 1 */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          flexWrap: 'wrap'
        }}>
          {/* Start Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', color: currentTheme === 'light' ? '#475569' : '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>Start Date</span>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="audio-date-input"
              style={{
                background: currentTheme === 'light' ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)',
                border: currentTheme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: currentTheme === 'light' ? '#0f172a' : '#ffffff',
                fontSize: '12.5px',
                outline: 'none',
                colorScheme: currentTheme === 'light' ? 'light' : 'dark',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* End Date */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ fontSize: '12.5px', color: currentTheme === 'light' ? '#475569' : '#94a3b8', fontWeight: 500, whiteSpace: 'nowrap' }}>End Date</span>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="audio-date-input"
              style={{
                background: currentTheme === 'light' ? '#f8fafc' : 'rgba(0, 0, 0, 0.3)',
                border: currentTheme === 'light' ? '1px solid #cbd5e1' : '1px solid rgba(255, 255, 255, 0.1)',
                borderRadius: '8px',
                padding: '6px 10px',
                color: currentTheme === 'light' ? '#0f172a' : '#ffffff',
                fontSize: '12.5px',
                outline: 'none',
                colorScheme: currentTheme === 'light' ? 'light' : 'dark',
                cursor: 'pointer',
                transition: 'all 0.2s ease'
              }}
            />
          </div>

          {/* Apply Filter Button */}
          <button
            type="button"
            onClick={handleApplyDateFilter}
            style={{
              background: currentTheme === 'light' ? '#0f172a' : '#181f2a',
              border: currentTheme === 'light' ? '1px solid #0f172a' : '1px solid rgba(255, 255, 255, 0.15)',
              borderRadius: '8px',
              padding: '6px 14px',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: currentTheme === 'light' ? '0 2px 6px rgba(0, 0, 0, 0.1)' : '0 2px 6px rgba(0, 0, 0, 0.2)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = currentTheme === 'light' ? '#1e293b' : '#222d3d';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = currentTheme === 'light' ? '#0f172a' : '#181f2a';
            }}
          >
            Apply Filter
          </button>

          {/* Reset Filters Button */}
          <button
            type="button"
            onClick={handleResetDateFilter}
            style={{
              background: '#2563eb',
              border: 'none',
              borderRadius: '8px',
              padding: '6px 14px',
              color: '#ffffff',
              fontSize: '12.5px',
              fontWeight: 600,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#1d4ed8';
              e.currentTarget.style.boxShadow = '0 4px 12px rgba(37, 99, 235, 0.5)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#2563eb';
              e.currentTarget.style.boxShadow = '0 2px 8px rgba(37, 99, 235, 0.3)';
            }}
          >
            Reset Filters
          </button>
        </div>

        {/* Right side controls */}
        <div className="audio-filters-right">
          {/* Status filter */}
          <div className="audio-filter-item">
            <span className="audio-filter-label">Status</span>
            <select
              className="audio-select-dropdown"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
              <option value="stopped">Stopped</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          {/* Sort By filter */}
          <div className="audio-filter-item">
            <span className="audio-filter-label">Sort by</span>
            <select
              className="audio-select-dropdown"
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="duration_desc">Duration (Longest)</option>
              <option value="duration_asc">Duration (Shortest)</option>
              <option value="size_desc">Size (Largest)</option>
              <option value="size_asc">Size (Smallest)</option>
              <option value="name_asc">File Name (A-Z)</option>
              <option value="name_desc">File Name (Z-A)</option>
            </select>
          </div>

          {/* View mode toggle (List / Grid) */}
          <div className="audio-view-mode-toggle">
            <button
              className={`audio-view-btn ${viewMode === 'list' ? 'active' : ''}`}
              onClick={() => setViewMode('list')}
              title="List View"
              type="button"
            >
              <FontAwesomeIcon icon={faList} style={{ fontSize: '15px' }} />
            </button>
            <button
              className={`audio-view-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
              type="button"
            >
              <FontAwesomeIcon icon={faThLarge} style={{ fontSize: '15px' }} />
            </button>
          </div>
        </div>
      </div>

      {statusMessage && (

        <div

          style={{

            position: 'fixed',

            top: '80px',

            right: '20px',

            backgroundColor:

              statusMessage.type === 'error' ? '#f44336' :

                statusMessage.type === 'warning' ? '#ff9800' :

                  statusMessage.type === 'success' ? '#4caf50' :

                    '#2196f3',

            color: 'white',

            padding: '16px 24px',

            borderRadius: '8px',

            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',

            zIndex: 10000,

            fontSize: '14px',

            maxWidth: '400px',

            lineHeight: '1.5',

            animation: 'slideIn 0.3s ease-out',

          }}

        >

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>

            <span style={{ fontSize: '18px' }}>

              {statusMessage.type === 'error' ? '❌' :

                statusMessage.type === 'warning' ? '⚠️' :

                  statusMessage.type === 'success' ? '✅' :

                    'ℹ️'}

            </span>

            <div style={{ flex: 1 }}>

              {statusMessage.text}

            </div>

            <button

              onClick={() => setStatusMessage(null)}

              style={{

                background: 'transparent',

                border: 'none',

                color: 'white',

                cursor: 'pointer',

                fontSize: '18px',

                padding: '0',

                lineHeight: '1',

              }}

            >

              ×

            </button>

          </div>

        </div>

      )}

      {viewMode === 'grid' ? (
        <div className="audio-grid-container">
          {tableData.sortedFiles.length === 0 ? (
            <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '3rem', color: '#94a3b8' }}>
              <p style={{ fontSize: '18px', marginBottom: '8px' }}>No audio files found</p>
              <p style={{ fontSize: '14px', color: '#64748b' }}>Try changing your search query or status filter.</p>
            </div>
          ) : (
            tableData.sortedFiles.map(file => (
              <div key={file.id} className="audio-grid-card">
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{
                    width: '42px',
                    height: '42px',
                    borderRadius: '10px',
                    ...getFileIconStyle(file.fileName),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#ffffff' }}>
                      <path d="M9 18V5l12-2v13" />
                      <circle cx="6" cy="18" r="3" fill="currentColor" />
                      <circle cx="18" cy="16" r="3" fill="currentColor" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontWeight: 600,
                        fontSize: '14px',
                        color: '#f8fafc',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis'
                      }}
                      title={file.fileName}
                      onClick={() => {
                        setSelectedFile(file);
                        setShowTranscriptPopover(true);
                      }}
                    >
                      {file.fileName}
                    </div>
                    <div style={{ fontSize: '11px', color: '#94a3b8', marginTop: '2px' }}>
                      {formatSubHeader(file)}
                    </div>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '13px', color: '#cbd5e1' }}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: '#94a3b8' }}>
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{file.duration || '00:00:00'}</span>
                  </div>
                  <div style={{ fontSize: '12px', color: '#94a3b8' }}>
                    {file.fileSize}
                  </div>
                  <div>
                    {renderStatusBadge(file.fileStatus)}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      ) : (
        <div className="audio-files-table-wrapper">

          <Tile className="audio-files-table" style={tableContainerStyle}>

            <main style={{ padding: '5px', height: '100%', overflow: 'hidden' }}>

              {tableData.body.length === 0 && !loading ? (

                <div style={{

                  display: 'flex',

                  justifyContent: 'center',

                  alignItems: 'center',

                  height: '400px',

                  flexDirection: 'column',

                  color: '#a0aec0'

                }}>

                  <p style={{ fontSize: '18px', marginBottom: '10px' }}>No data available</p>

                  <p style={{ fontSize: '14px' }}>No audio files found for the selected search or status filter.</p>

                </div>

              ) : (

                <TableBox

                  key={`table-${tableData.sortedFiles.length}-${sortOption}-${statusFilter}-${searchQuery}`}

                  header={tableData.header}

                  data={tableData.body}

                  downloadFileName={'audio-files'}

                  loading={loading}

                  onClick={handleTableClick}

                  onSort={handleTableSort}

                  pageSize={pageSize}

                  sortIndex={sortIndex}

                />

              )}

            </main>

          </Tile>

        </div>
      )}

      <ConfirmationDialog

        isOpen={showDeleteDialog}

        title="Delete Audio File"

        message={`Are you sure you want to delete "${fileToDelete?.fileName}"? This action cannot be undone.`}

        confirmText="Delete"

        cancelText="Cancel"

        onConfirm={handleDeleteConfirm}

        onCancel={handleDeleteCancel}

        type="danger"

      />

 

      {showTranscriptPopover && selectedFile && (

        <ErrorBoundary>

          <TranscriptWindowChunked

            jobId={selectedFile.jobId}

            fileId={selectedFile.id}

            header={`Transcript - ${selectedFile.fileName}`}

            loading={false}

            onClose={handleCloseTranscript}

          />

        </ErrorBoundary>

      )}

 

      {showRetryPanel && retryFile && (

        <RetryPanel

          jobId={retryFile.jobId}

          fileId={retryFile.id}

          fileName={retryFile.fileName}

          onClose={handleCloseRetryPanel}

        />

      )}

 

      {showProgressBar && progressFile && (

        <FileProgressBar

          jobId={progressFile.jobId}

          fileId={progressFile.id}

          fileName={progressFile.fileName}

          onClose={() => {

            setShowProgressBar(false);

            setProgressFile(null);

            setRefreshTrigger(prev => prev + 1);

          }}

        />

      )}

    </div>

  );

};

 

export default AudioFilesTable;

 

 

 

 

 

 

 