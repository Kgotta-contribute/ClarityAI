
/**

 * Utility function to pause audio player

 * @param playerRef - Reference to the audio player

 */

export const pauseAudioPlayer = (playerRef: React.RefObject<unknown>): void => {

  if (playerRef.current) {

    try {

      const audioElement = playerRef.current as { pause?: () => void };

      if (audioElement.pause) {

        audioElement.pause();

      }

    } catch (error) {

      console.error('Error pausing audio:', error);

    }

  }

};

 

/**

 * Normalize speaker names for display

 * @param speaker - Raw speaker name from transcript

 * @returns Normalized display name

 */

export const normalizeSpeakerName = (speaker: string): string => {

  if (!speaker) {

    return 'Unknown Speaker';

  }

 

  // Handle single letter speaker codes (A, B, C, etc.)

  if (speaker.length === 1 && /[A-Z]/i.test(speaker)) {

    const speakerCode = speaker.toUpperCase().charCodeAt(0) - 64;

    return `Person-${speakerCode}`;

  }

 

  const lowerSpeaker = speaker.toLowerCase();

 

  // Map known speaker types

  if (['agent', 'internal'].includes(lowerSpeaker)) {

    return 'Person-1';

  }

  if (lowerSpeaker === 'external') {

    return 'Person-2';

  }

  if (lowerSpeaker === 'chatbot') {

    return 'Person-3';

  }

 

  return speaker;

};

 

/**

 * Determine speaker role for chat bubble styling

 * @param speaker - Raw speaker name

 * @returns Role type for styling

 */

export const getSpeakerRole = (speaker: string): 'self' | 'default' | 'special' => {

  const lowerSpeaker = speaker.toLowerCase();

 

  if (['agent', 'internal'].includes(lowerSpeaker)) {

    return 'self';

  }

  if (lowerSpeaker === 'chatbot') {

    return 'special';

  }

  return 'default';

};

 