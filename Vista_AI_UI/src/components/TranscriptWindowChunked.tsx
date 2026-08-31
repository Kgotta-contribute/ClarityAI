import React, { useState, useEffect, useRef, useMemo } from 'react';
import { SecondsToHHMMSS } from '../utils/audioUtils';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faDownload, faFileAlt } from '@fortawesome/free-solid-svg-icons';
import { downloadTranscriptAsWord as downloadTranscript } from '../utils/transcriptExport';
import ChatBubble from './shared/ChatBubble';
import { normalizeSpeakerName, getSpeakerRole } from '../utils/audioPlayerUtils';
import { getAudioChunks, downloadRawTranscript as downloadRawTranscriptAPI, type AudioChunksResponse } from '../services/apiService';
import { apiConfig } from '../config/api.config';
import styles from './styles/TranscriptWindowChunked.module.css';
import { showToast } from '../../src/components/Toast/ToastContainer';

interface TranscriptWindowChunkedProps {
  jobId: string;
  fileId: string;
  header: string;
  loading?: boolean;
  onClose: () => void;
}

const TranscriptWindowChunked: React.FC<TranscriptWindowChunkedProps> = ({
  jobId,
  fileId,
  header,
  loading = false,
  onClose,
}) => {
  const transcriptAreaRef = useRef<HTMLDivElement>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  const [currentAudioTime, setCurrentAudioTime] = useState(0);
  const [isTranscriptScrolling, setIsTranscriptScrolling] = useState(false);
  const chatBubbleRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [audioLoadError, setAudioLoadError] = useState<string | null>(null);
  const [activeChunk, setActiveChunk] = useState(0);
  const [isLoadingChunks, setIsLoadingChunks] = useState(true);
  const [chunksMetadata, setChunksMetadata] = useState<AudioChunksResponse | null>(null);
  const [chunksLoadError, setChunksLoadError] = useState<string | null>(null);

  const hasChunks = !!(chunksMetadata?.chunks && chunksMetadata.chunks.length > 0);

  // Fetch chunks metadata on mount
  useEffect(() => {
    const fetchChunksMetadata = async () => {
      if (!jobId || !fileId) return;
      try {
        setIsLoadingChunks(true);
        const data = await getAudioChunks(jobId, fileId);
        setChunksMetadata(data);
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Failed to load audio chunks metadata';
        setChunksLoadError(errorMessage);
      } finally {
        setIsLoadingChunks(false);
      }
    };

    fetchChunksMetadata();
  }, [jobId, fileId]);

  // Current active chunk transcript segments: [timestampMs, speaker, text]
  const currentChunkTranscript = useMemo(() => {
    if (!chunksMetadata || !hasChunks) return [];
    const chunk = chunksMetadata.chunks[activeChunk];
    if (!chunk || !chunk.transcriptSegments) return [];

    return chunk.transcriptSegments.map(segment => [
      segment.start * 1000,
      segment.speaker,
      segment.text
    ] as [number, string, string]);
  }, [chunksMetadata, activeChunk, hasChunks]);

  const activeChatBubbleIndex = useMemo(() => {
    if (currentChunkTranscript.length === 0) return -1;
    const chunk = chunksMetadata?.chunks[activeChunk];
    if (!chunk) return -1;

    for (let index = 0; index < currentChunkTranscript.length; index++) {
      const item = currentChunkTranscript[index];
      const currentTimeInSeconds = item[0] * 0.001;
      const nextTimeInSeconds = currentChunkTranscript[index + 1]
        ? currentChunkTranscript[index + 1][0] * 0.001
        : chunk.endTime;

      if (currentAudioTime >= currentTimeInSeconds && currentAudioTime < nextTimeInSeconds) {
        return index;
      }
    }
    return 0;
  }, [currentAudioTime, currentChunkTranscript, chunksMetadata, activeChunk]);

  // Jump to exact timecode and play
  const handleJumpToTime = (timeInSeconds: number) => {
    if (audioRef.current) {
      audioRef.current.currentTime = timeInSeconds;
      setCurrentAudioTime(timeInSeconds);
      const playPromise = audioRef.current.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Autoplay was prevented, retrying:", err);
        });
      }
    }
  };

  // Scroll active chat bubble into view as audio plays
  useEffect(() => {
    if (activeChatBubbleIndex >= 0 && !isTranscriptScrolling && chatBubbleRefs.current[activeChatBubbleIndex]) {
      const activeBubble = chatBubbleRefs.current[activeChatBubbleIndex];
      if (activeBubble && transcriptAreaRef.current) {
        activeBubble.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      }
    }
  }, [activeChatBubbleIndex, isTranscriptScrolling]);

  const downloadTranscriptAsWord = async () => {
    if (!chunksMetadata || !hasChunks) return;

    const allTranscriptSegments = chunksMetadata.chunks.flatMap(chunk =>
      chunk.transcriptSegments.map(segment => ({
        time: segment.start * 1000,
        speaker: segment.speaker,
        phrase: segment.text
      }))
    );

    if (allTranscriptSegments.length === 0) {
      showToast('No audio available for this file. Therefore, no transcript could be generated', 'warning', 5000);
      return;
    }

    await downloadTranscript({
      header,
      interaction: allTranscriptSegments,
      startTime: 0
    });
  };

  const downloadRawTranscript = async () => {
    if (!jobId || !fileId) return;
    try {
      const { blob, headers } = await downloadRawTranscriptAPI(jobId, fileId);
      if (headers['x-message']) {
        showToast(headers['x-message'], 'warning', 5000);
      }
      const blobUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${fileName}_raw_transcript.txt`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    } catch (error) {
      console.error('Failed to download raw transcript:', error);
    }
  };

  const streamUrl = hasChunks
    ? `${apiConfig.baseUrl}/v1/jobId/${jobId}/fileId/${fileId}/streamAudio`
    : null;

  const getFileName = () => {
    if (chunksMetadata?.fileName) {
      return chunksMetadata.fileName.replace(/\.[^/.]+$/, '');
    }
    const match = header.match(/Transcript - (.+)/);
    return match ? match[1].replace(/\.[^/.]+$/, '') : 'Audio';
  };

  const fileName = getFileName();

  return (
    <>
      <div className={styles.modalOverlay} onClick={onClose} />

      <div className={styles.modalContainer}>
        <div className={styles.contentWrapper}>
          <div className={styles.header}>
            <h3 className={styles.headerTitle}>{header}</h3>
            <div className={styles.headerActions}>
              <button
                onClick={downloadTranscriptAsWord}
                disabled={!hasChunks}
                className={`${styles.button} ${styles.downloadButton} ${hasChunks ? styles.downloadButtonEnabled : styles.downloadButtonDisabled}`}
                title="Download transcript as Word document"
              >
                <FontAwesomeIcon icon={faDownload} />
                Download Transcript
              </button>

              <button
                onClick={downloadRawTranscript}
                className={`${styles.button} ${styles.downloadButton} ${styles.downloadButtonEnabled}`}
                title="Download raw transcript without speaker names"
              >
                <FontAwesomeIcon icon={faFileAlt} />
                Download Raw
              </button>

              <button
                onClick={onClose}
                className={`${styles.button} ${styles.closeButton}`}
              >
                X
              </button>
            </div>
          </div>

          {/* Chunk Selector Tabs — Clicking a chunk exclusively selects and plays that chunk only */}
          {chunksMetadata && chunksMetadata.chunks && chunksMetadata.chunks.length > 1 && (
            <div className={styles.chunkTabs}>
              {chunksMetadata.chunks.map((chunk, index) => {
                const startMin = Math.floor(chunk.startTime / 60);
                const startSec = Math.floor(chunk.startTime % 60);
                const endMin = Math.floor(chunk.endTime / 60);
                const endSec = Math.floor(chunk.endTime % 60);

                return (
                  <button
                    key={index}
                    onClick={() => {
                      setActiveChunk(index);
                      handleJumpToTime(chunk.startTime);
                    }}
                    className={`${styles.chunkTab} ${activeChunk === index ? styles.chunkTabActive : styles.chunkTabInactive}`}
                  >
                    {fileName} (Part {chunk.chunkNumber}/{chunk.totalChunks})
                    <div className={styles.chunkTabTime}>
                      {startMin}:{String(startSec).padStart(2, '0')} - {endMin}:{String(endSec).padStart(2, '0')}
                    </div>
                  </button>
                );
              })}
            </div>
          )}

          {/* Transcript Area — Shows strictly the currently selected chunk */}
          <div className={styles.audioPlayerContainer}>
            <div
              ref={transcriptAreaRef}
              className={`${styles.transcriptArea} ${styles.transcriptAreaScrollable}`}
              onScroll={() => {
                setIsTranscriptScrolling(true);
                setTimeout(() => setIsTranscriptScrolling(false), 1000);
              }}
            >
              {(loading || isLoadingChunks) && (
                <div className={styles.messageContainer}>
                  Loading transcript...
                </div>
              )}

              {!loading && !isLoadingChunks && chunksLoadError && (
                <div className={styles.errorContainer}>
                  <div className={styles.messageTitle}>Error loading audio chunks</div>
                  <div className={styles.messageText}>{chunksLoadError}</div>
                </div>
              )}

              {!loading && !isLoadingChunks && !chunksLoadError && currentChunkTranscript.length === 0 && (
                <div className={styles.emptyContainer}>
                  <div className={styles.messageTitle}>No transcript available</div>
                  <div className={styles.messageText}>This chunk may not have transcript data available.</div>
                </div>
              )}

              {!loading && !isLoadingChunks && currentChunkTranscript.length > 0 &&
                currentChunkTranscript.map((item, index) => {
                  const [timeMs, speaker, phrase] = item;
                  const timeInSeconds = timeMs * 0.001;
                  const isActive = activeChatBubbleIndex === index;
                  const displayName = normalizeSpeakerName(speaker);

                  return (
                    <div
                      key={`chat-${index}`}
                      ref={(el) => {
                        chatBubbleRefs.current[index] = el;
                      }}
                      className={`${styles.chatBubbleWrapper} ${isActive ? styles.chatBubbleActive : styles.chatBubbleInactive}`}
                    >
                      <ChatBubble
                        time={SecondsToHHMMSS(timeInSeconds)}
                        name={displayName}
                        role={getSpeakerRole(speaker)}
                        isActive={isActive}
                        onTimeClick={(_e, _timeStr) => handleJumpToTime(timeInSeconds)}
                      >
                        {phrase}
                      </ChatBubble>
                    </div>
                  );
                })}
            </div>
          </div>

          {/* HTML5 Audio Player — Strictly auto-pauses when reaching the end of the selected chunk */}
          {!loading && (
            <div className={styles.waveformContainer}>
              {hasChunks && (
                audioLoadError ? (
                  <div className={`${styles.audioMessage} ${styles.audioError}`}>
                    Failed to load audio: {audioLoadError}
                  </div>
                ) : (
                  <audio
                    ref={audioRef}
                    controls
                    src={streamUrl || undefined}
                    style={{ width: '100%', borderRadius: '8px', marginTop: '4px' }}
                    onTimeUpdate={() => {
                      if (audioRef.current) {
                        const t = audioRef.current.currentTime;
                        setCurrentAudioTime(t);
                        // Strictly stop playback when reaching the selected chunk's end boundary
                        const currentChunk = chunksMetadata?.chunks[activeChunk];
                        if (currentChunk && t >= currentChunk.endTime) {
                          audioRef.current.pause();
                        }
                      }
                    }}
                    onError={() => {
                      setAudioLoadError('Failed to load audio stream. The audio file may not be available.');
                    }}
                  />
                )
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
};

export default TranscriptWindowChunked;
