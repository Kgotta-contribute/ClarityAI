
export const notifyAudioPlayback = (isPlaying: boolean): void => {

  if (window.inactivityTracker) {

    window.inactivityTracker.setAudioPlaying(isPlaying);

  }

};

 

export const notifyFileUpload = (isUploading: boolean): void => {

  if (window.inactivityTracker) {

    window.inactivityTracker.setFileUploading(isUploading);

  }

};

 

export const notifyUserActivity = (): void => {

  if (window.inactivityTracker) {

    window.inactivityTracker.resetActivity();

  }

};

 

export const getInactivityState = () => {

  if (window.inactivityTracker) {

    return {

      isAudioPlaying: window.inactivityTracker.getAudioPlayingState(),

      isFileUploading: window.inactivityTracker.getFileUploadingState(),

      isUserInactive: window.inactivityTracker.isUserInactive(),

      timeSinceLastActivity: window.inactivityTracker.getTimeSinceLastActivity(),

    };

  }

  return null;

};

 

 

 