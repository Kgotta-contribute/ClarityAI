
export const SecondsToMSS = (seconds: number): string => {

  const minutes = Math.floor(seconds / 60);

  const remainingSeconds = Math.floor(seconds % 60);

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

};

 

export const SecondsToHHMMSS = (seconds: number): string => {

  const hours = Math.floor(seconds / 3600);

  const minutes = Math.floor((seconds % 3600) / 60);

  const remainingSeconds = Math.floor(seconds % 60);

 

  if (hours > 0) {

    return `${hours}:${minutes.toString().padStart(2, '0')}:${remainingSeconds.toString().padStart(2, '0')}`;

  }

  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;

};

 

export const SecondsFromHMMSS = (timeString: string): number => {

  const parts = timeString.split(':').map(Number);

  if (parts.length === 3) {

    return parts[0] * 3600 + parts[1] * 60 + parts[2];

  } else if (parts.length === 2) {

    return parts[0] * 60 + parts[1];

  }

  return 0;

};

 

export const getAllAudioDurations = async (audioUrls: string[]): Promise<number[]> => {

  const durations = await Promise.all(

    audioUrls.map(url => getAudioDuration(url))

  );

  return durations;

};

 

export const getAudioDuration = (audioUrl: string): Promise<number> => {

  return new Promise((resolve) => {

    const audio = new Audio(audioUrl);

    audio.addEventListener('loadedmetadata', () => {

      resolve(audio.duration);

    });

    audio.addEventListener('error', () => {

      resolve(0);

    });

  });

};

 

export const formatFileSize = (bytes: number): string => {

  if (bytes === 0) return '0 Bytes';

  const k = 1024;

  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];

};

 

 